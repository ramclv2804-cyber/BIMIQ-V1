import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

// In production, set JWT_SECRET via environment variable
const JWT_SECRET = process.env['JWT_SECRET'] || 'bimiq-jwt-secret-dev-only-change-in-production';
const TOKEN_EXPIRY = '7d';

export interface JwtPayload {
  userId: number;
  username: string;
  email: string;
  role: string;
  jti?: string; // JWT ID for revocation
}

// ── Token Blocklist (in-memory map) ──
// Stores jti -> expiry timestamp (ms) for revoked tokens.
// A more production-ready approach would use Redis or a DB table.
const tokenBlocklist = new Map<string, number>();

/** Interval handle for periodic cleanup of expired blocklist entries. */
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

/** Start periodic cleanup of expired blocklist entries (every 5 minutes). */
function startCleanupInterval() {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [jti, expiry] of tokenBlocklist.entries()) {
      if (expiry <= now) {
        tokenBlocklist.delete(jti);
      }
    }
  }, 5 * 60 * 1000);
  // Allow the Node process to exit even if this interval is still running
  if (cleanupInterval && typeof cleanupInterval === 'object' && 'unref' in cleanupInterval) {
    cleanupInterval.unref();
  }
}

/**
 * Revoke a JWT token by adding its jti to the blocklist.
 * @param jti The JWT ID from the token payload.
 * @param expiry The expiry timestamp (ms) of the token — the blocklist entry is auto-cleaned after this.
 */
export function revokeToken(jti: string, expiry: number): void {
  tokenBlocklist.set(jti, expiry);
  startCleanupInterval();
}

/**
 * Check if a token has been revoked.
 */
export function isTokenRevoked(jti: string): boolean {
  return tokenBlocklist.has(jti);
}

/**
 * Generate a JWT token for an authenticated user.
 */
export function generateToken(payload: JwtPayload): string {
  // Generate a unique JWT ID for revocation tracking
  const jti = `${payload.userId}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return jwt.sign({ ...payload, jti }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Verify a JWT token and return the decoded payload.
 * Throws if the token is revoked or invalid.
 */
export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & { jti?: string };

  // Check if the token has been revoked
  if (decoded.jti && isTokenRevoked(decoded.jti)) {
    throw new Error('Token has been revoked.');
  }

  return decoded;
}

/**
 * Express middleware that requires a valid JWT Bearer token.
 * Attaches decoded user info to `req.user`.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization header with Bearer token is required.' });
      return;
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);

    // Attach user info and raw token to request for downstream handlers
    (req as unknown as { [key: string]: unknown })['user'] = decoded;
    (req as unknown as { [key: string]: unknown })['rawToken'] = token;
    next();
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === 'Token has been revoked.') {
      res.status(401).json({ error: 'Token has been revoked. Please log in again.' });
    } else if (err.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Token has expired. Please log in again.' });
    } else {
      res.status(401).json({ error: 'Invalid or malformed token.' });
    }
  }
}

/**
 * Express middleware that optionally attaches user info if a valid token is present.
 * Does not reject the request if no token is provided.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const decoded = verifyToken(token);
      (req as unknown as { [key: string]: unknown })['user'] = decoded;
      (req as unknown as { [key: string]: unknown })['rawToken'] = token;
    }
  } catch {
    // Silently ignore invalid tokens for optional auth
  }
  next();
}
