import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import 'dotenv/config';
import { initDatabase, createUser, getUserByUsername, getUserByEmail, getUserById, createProject, getUserProjects, getAllUsers, getAllProjects, getAdminDashboardStats, validateDatabase, authenticateUser, seedDefaultUsers, createTicket, getProjectTickets, getUserTickets, getAllTickets, updateTicketStatus, updateProjectWorkflowStatus } from './server/database';
import { generateToken, requireAuth, optionalAuth, revokeToken } from './server/auth';
import { sendMail, sendTicketRaiseEmail } from './server/mail';

const serverDir = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = join(serverDir, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Body parser limits configured for spatial layout plans
app.use(express.json({ limit: '250mb' }));
app.use(express.urlencoded({ limit: '250mb', extended: true }));

// ── Initialize SQLite Database & seed default users ──
initDatabase();
seedDefaultUsers();

// ═══════════════════════════════════════════════
//  AUTH API ROUTES (public)
// ═══════════════════════════════════════════════

/**
 * POST /api/auth/signup
 * Create a new user account. Returns user info + JWT token.
 * Body: { username, password, email }
 */
app.post('/api/auth/signup', (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ error: 'username, password, and email are required.' });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters.' });
    }

    // Check if user already exists
    const existingUser = getUserByUsername(username) || getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Username or email already registered.' });
    }

    const user = createUser(username, password, email);

    // Generate JWT
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    return res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[DB] Signup error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error during signup.' });
  }
});

/**
 * POST /api/auth/login
 * Authenticate a user by username/email and password. Returns JWT token.
 * Body: { username, password } — username field can be a username or email.
 */
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required.' });
    }

    // Authenticate with scrypt hashed password
    const user = authenticateUser(username, password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Generate JWT
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    return res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[DB] Login error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error during login.' });
  }
});

/**
 * POST /api/auth/verify
 * Verify a JWT token is still valid. Returns the decoded payload.
 * Headers: Authorization: Bearer <token>
 */
app.post('/api/auth/verify', optionalAuth, (req, res) => {
  const user = (req as unknown as { [key: string]: unknown })['user'];
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
  return res.json(user);
});

/**
 * POST /api/auth/logout
 * Revoke the current JWT token so it can no longer be used.
 * Headers: Authorization: Bearer <token>
 */
app.post('/api/auth/logout', requireAuth, (req, res) => {
  try {
    const user = (req as unknown as { [key: string]: unknown })['user'] as { jti?: string; userId: number };
    const rawToken = (req as unknown as { [key: string]: unknown })['rawToken'] as string;

    if (user.jti) {
      // Decode the token to get its expiry for the blocklist cleanup
      const decoded = JSON.parse(Buffer.from(rawToken.split('.')[1], 'base64url').toString());
      const expiryMs = (decoded.exp as number) * 1000;
      revokeToken(user.jti, expiryMs);
      console.log(`[Auth] Token revoked for user id=${user.userId} (jti=${(user as { jti: string }).jti})`);
    }

    return res.json({ message: 'Session disconnected successfully.' });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[Auth] Logout error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error during logout.' });
  }
});

// ═══════════════════════════════════════════════
//  USER API ROUTES (protected)
// ═══════════════════════════════════════════════

/**
 * GET /api/users
 * List all registered users (passwords omitted). Requires JWT auth.
 */
app.get('/api/users', requireAuth, (_req, res) => {
  try {
    const users = getAllUsers().filter(u => u.role === 'client');
    return res.json({ users, count: users.length });
  } catch (error: unknown) {
    const err = error as Error;
    return res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════
//  ADMIN DASHBOARD API ROUTE (protected)
// ═══════════════════════════════════════════════

/**
 * GET /api/admin/dashboard
 * Returns aggregated dashboard statistics. Admin only.
 */
app.get('/api/admin/dashboard', requireAuth, (req, res) => {
  try {
    const authUser = (req as unknown as { [key: string]: unknown })['user'] as { userId: number; role: string };
    if (authUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    const stats = getAdminDashboardStats();
    return res.json(stats);
  } catch (error: unknown) {
    const err = error as Error;
    return res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════
//  PROJECT API ROUTES (protected)
// ═══════════════════════════════════════════════

/**
 * POST /api/projects
 * Create a new project for a user. Requires JWT auth.
 * Body: { project_name, ... } (user_id is taken from the JWT token)
 */
app.post('/api/projects', requireAuth, (req, res) => {
  try {
    const authUser = (req as unknown as { [key: string]: unknown })['user'] as { userId: number };
    const { ...projectData } = req.body;

    if (!projectData.project_name) {
      return res.status(400).json({ error: 'project_name is required.' });
    }

    const project = createProject(authUser.userId, projectData);
    return res.status(201).json(project);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[DB] Create project error:', err);
    const status = err.message.includes('already exists') ? 409 : 500;
    return res.status(status).json({ error: err.message || 'Internal server error creating project.' });
  }
});

/**
 * GET /api/projects
 * Get projects — by default for the authenticated user.
 * Admins can pass ?user_id=X to view another user's projects.
 * Production users see all projects
 * Requires JWT auth.
 */
app.get('/api/projects', requireAuth, (req, res) => {
  try {
    const authUser = (req as unknown as { [key: string]: unknown })['user'] as { userId: number; role: string };
    const targetUserId = req.query['user_id'] ? Number(req.query['user_id']) : null;

    // If a specific user_id is requested, only admins may do this
    if (targetUserId) {
      if (authUser.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can view other users projects.' });
      }
      const targetUser = getUserById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ error: 'User not found.' });
      }
      const projects = getUserProjects(targetUserId);
      return res.json({ projects, count: projects.length });
    }

    // Production users see all projects (skip user filter)
    if (authUser.role === 'production') {
      const projects = getAllProjects();
      return res.json({ projects, count: projects.length });
    }

    const projects = getUserProjects(authUser.userId);
    return res.json({ projects, count: projects.length });
  } catch (error: unknown) {
    const err = error as Error;
    return res.status(500).json({ error: err.message });
  }
});


/**
 * PATCH /api/projects/:id
 * Update a project (e.g., change workflow_status). Requires JWT auth.
 */
app.patch('/api/projects/:id', requireAuth, (req, res) => {
  try {
    const authUser = (req as unknown as { [key: string]: unknown })['user'] as { userId: number; role: string };
    const id = Number(req.params['id']);
    const { workflow_status } = req.body;

    if (!workflow_status) {
      return res.status(400).json({ error: 'workflow_status is required.' });
    }

    // Only admin and production roles can update project status
    if (authUser.role !== 'admin' && authUser.role !== 'production') {
      return res.status(403).json({ error: 'Only admin or production users can update project status.' });
    }

    const project = updateProjectWorkflowStatus(id, workflow_status);
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    return res.json(project);
  } catch (error: unknown) {
    const err = error as Error;
    return res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════
//  DATABASE VALIDATION ROUTE (protected)
// ═══════════════════════════════════════════════

/**
 * GET /api/db/validate
 * Returns full database structure, records, and any validation errors.
 * Requires JWT auth.
 */
app.get('/api/db/validate', requireAuth, (_req, res) => {
  try {
    const result = validateDatabase();
    return res.json(result);
  } catch (error: unknown) {
    const err = error as Error;
    return res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════
//  TICKET API ROUTES (protected)
// ═══════════════════════════════════════════════

/**
 * POST /api/tickets
 * Create a new ticket for a project. Requires JWT auth.
 * Body: { project_id?, project_name?, url?, comments? }
 */
app.post('/api/tickets', requireAuth, async (req, res) => {
  try {
    const authUser = (req as unknown as { [key: string]: unknown })['user'] as { userId: number; username: string; email: string };
    const ticketData = req.body;

    // Attach who raised this ticket (the authenticated user)
    const ticket = createTicket(authUser.userId, {
      ...ticketData,
      raised_by_username: authUser.username,
    });
    console.log(`[DB] Ticket created with id=${ticket.id} raised by user=${authUser.username} (id=${authUser.userId})`);

    // ── Send email notification (fire-and-forget, doesn't block response) ──
    sendTicketRaiseEmail({
      ticketId: ticket.id,
      projectName: ticketData.project_name || 'Unknown Project',
      raisedByUsername: authUser.username,
      raisedByEmail: authUser.email,
      ticketUrl: ticketData.ticket_urls || undefined,
      ticketComments: ticketData.ticket_comments || undefined,
    }).then(() => {
      console.log(`[Ticket] Email notification sent for ticket #${ticket.id}`);
    }).catch((err: Error) => {
      console.warn(`[Ticket] Failed to send email notification for ticket #${ticket.id}:`, err);
    });

    return res.status(201).json(ticket);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[DB] Create ticket error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error creating ticket.' });
  }
});

/**
 * GET /api/tickets
 * Get tickets — optionally filtered by project_id or user_id.
 * Admins can pass ?user_id=X to view another user's tickets.
 * Requires JWT auth.
 */
app.get('/api/tickets', requireAuth, (req, res) => {
  try {
    const authUser = (req as unknown as { [key: string]: unknown })['user'] as { userId: number; role: string };
    const projectId = req.query['project_id'] ? Number(req.query['project_id']) : null;
    const targetUserId = req.query['user_id'] ? Number(req.query['user_id']) : null;

    // If a specific user_id is requested, only admins may do this
    if (targetUserId) {
      if (authUser.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can view other users tickets.' });
      }
      const tickets = getUserTickets(targetUserId);
      return res.json({ tickets, count: tickets.length });
    }

    if (projectId) {
      const ticketStatus = req.query['ticket_status'] as string | undefined;
      const tickets = getProjectTickets(projectId, ticketStatus || undefined);
      return res.json({ tickets, count: tickets.length });
    }

    // Default: return current user's tickets
    const tickets = getUserTickets(authUser.userId);
    return res.json({ tickets, count: tickets.length });
  } catch (error: unknown) {
    const err = error as Error;
    return res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/tickets/:id
 * Update a ticket (e.g., change status). Requires JWT auth.
 */
app.patch('/api/tickets/:id', requireAuth, (req, res) => {
  try {
    const id = Number(req.params['id']);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status is required.' });
    }

    const ticket = updateTicketStatus(id, status);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }
    return res.json(ticket);
  } catch (error: unknown) {
    const err = error as Error;
    return res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════
//  IMAGE EXTRACTION ROUTE (public — no auth needed)
// ═══════════════════════════════════════════════

/**
 * Image-based blueprint data extractor API route
 */
app.post('/api/estimate/extract', async (req, res): Promise<unknown> => {
  try {
    const { imageBase64, mimeType, prompt } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 parameter is required' });
    }

    const apiKey = process.env['GEMINI_API_KEY'];
    if (!apiKey) {
      // Return high-fidelity mock extraction data if the API key is offline
      return res.json({
        spaceType: 'Office',
        scanSize: 1850,
        interiorScope: ['Architecture', 'MEP'],
        isComplexMepf: true,
        isExteriorRequired: true,
        exteriorScope: ['Architecture'],
        isSiteRequired: false,
        shortRationale: 'Demo CAD extractor output. Plans indicate 1,850 Sq.ft commercial room layouts with complex MEP grids and exterior elevations.'
      });
    }

    const { GoogleGenAI, Type } = await import('@google/genai');
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType || 'image/png'
      }
    };

    const textPart = {
      text: prompt || 'Analyze this architectural plan diagram, CAD floor plan sheet, or sketch layout and extract estimate parameters.'
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Standard modern multimodal model
      contents: [imagePart, textPart],
      config: {
        systemInstruction: `You are an expert BIM and architectural quantity surveyor system at BIM-IQ. 
        Your task is to analyze the upload (drawing, floor plan, sheet, blueprint, plan) and extract the following parameters:
        - spaceType: choose one value strictly from: ["Office", "Residential", "Retail", "Hospitality", "Medical", "Educational", "Industrial"]
        - scanSize: estimate or extract the floor area or scan size in square feet (Sq.ft). If none is mentioned, guess a realistic value between 800 and 5000 based on the layout density. Ensure it is an integer.
        - interiorScope: array of strings. Identify which interior system categories are active/drawn. Values can only be from: ["Architecture", "Furniture", "MEP"]
        - isComplexMepf: boolean. Is there heavy mechanical equipment, plumbing, electrical system, or fire protection mapped?
        - isExteriorRequired: boolean. Does it show exterior views, facades, site plans, elevation, or rendering of building shell?
        - exteriorScope: array of strings. Under exterior, what is active? Values can only be from: ["Architecture", "Furniture", "MEP"]
        - isSiteRequired: boolean. Does it show landscaping, site boundaries, plots or surrounding terrains?
        - shortRationale: a short 1-2 sentence human-readable rationale of what was identified in the drawing.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            spaceType: {
              type: Type.STRING,
              description: 'The classified space type.'
            },
            scanSize: {
              type: Type.INTEGER,
              description: 'The floor size or estimated scanned area in Sq.ft.'
            },
            interiorScope: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Systems scopes found in the drawing: Architecture, Furniture, MEP.'
            },
            isComplexMepf: {
              type: Type.BOOLEAN,
              description: 'Whether layout indicates dense/complex mechanical/plumbing systems.'
            },
            isExteriorRequired: {
              type: Type.BOOLEAN,
              description: 'Whether exterior modeling or envelope extraction is needed.'
            },
            exteriorScope: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Exterior layer scopes.'
            },
            isSiteRequired: {
              type: Type.BOOLEAN,
              description: 'Whether plot/site modeling is evident in drawing.'
            },
            shortRationale: {
              type: Type.STRING,
              description: 'Short 1-2 sentence human description of findings.'
            }
          },
          required: ['spaceType', 'scanSize', 'interiorScope', 'isComplexMepf', 'isExteriorRequired', 'exteriorScope', 'isSiteRequired', 'shortRationale']
        }
      }
    });

    const resultText = response.text || '{}';
    const parsed = JSON.parse(resultText);
    return res.json(parsed);

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Extraction error:', err);
    return res.status(500).json({ error: err.message || 'Error occurred during image extraction' });
  }
});

/**
 * POST /api/quote/request
 * Send a quote request email with project details.
 */
app.post('/api/quote/request', async (req, res) => {
  try {
    const { html, subject, email } = req.body;
    console.log(`[Quote] Received quote request for  subject: ${subject}`);

    const cc = process.env['MAILGUN_CC']?.split(',').map(s => s.trim()).filter(Boolean);
    const bcc = process.env['MAILGUN_BCC']?.split(',').map(s => s.trim()).filter(Boolean);

    await sendMail({
      to: 'unreal.qc.team@gmail.com',
      ...(cc?.length ? { cc } : {}),
      ...(bcc?.length ? { bcc } : {}),
      subject: subject || 'New Quote Request',
      html: html || '',
    });

    console.log(`[Quote] Quote email sent`);
    return res.json({ success: true, message: `Quote request sent` });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[Quote] Error sending quote email:', err);
    return res.status(500).json({ error: err.message || 'Failed to send quote request' });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 9001;

  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
