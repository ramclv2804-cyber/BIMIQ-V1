import Database from 'better-sqlite3';
import { join, sep } from 'node:path';
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';

function getDbPath(): string {
  // Allow override via environment variable
  if (process.env['DB_PATH']) return process.env['DB_PATH'];

  const currentDir = import.meta.dirname;

  // Production: running from dist/app/server/
  if (currentDir.includes(`${sep}dist${sep}`)) {
    return join(currentDir, '..', 'database.db');
  }

  // Development: running from .angular cache via ng serve
  // process.cwd() is the project root
  return join(process.cwd(), 'src', 'database.db');
}

const DB_PATH = getDbPath();

let db: Database.Database;

// ── Password Hashing (scrypt) ──

const HASH_KEY_LEN = 64;

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, HASH_KEY_LEN);
  return `${salt}:${derivedKey.toString('hex')}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(':');
  const derivedKey = scryptSync(password, salt, HASH_KEY_LEN);
  const keyBuf = Buffer.from(key, 'hex');
  const derivedBuf = Buffer.from(derivedKey);
  // Constant-time comparison to prevent timing attacks
  if (keyBuf.length !== derivedBuf.length) return false;
  return timingSafeEqual(keyBuf, derivedBuf);
}

// ── Database Initialization ──

/**
 * Initialize the SQLite database and create tables if they do not exist.
 * Returns the database instance.
 */
export function initDatabase(): Database.Database {
  if (db) return db;

  db = new Database(DB_PATH);

  // Enable WAL mode for better concurrent performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // ── Users table ──
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      username   TEXT    NOT NULL UNIQUE,
      password   TEXT    NOT NULL,
      email      TEXT    NOT NULL UNIQUE,
      role       TEXT    DEFAULT 'user',
      created_at TEXT    DEFAULT (datetime('now'))
    )
  `);

  // ── Projects table ──
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id                        INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id                   INTEGER NOT NULL,
      project_no                TEXT,
      client                    TEXT,
      project_name              TEXT    NOT NULL,
      building_type             TEXT,
      description               TEXT,
      requirements              TEXT,
      scope                     TEXT,
      lod                       TEXT,
      scale                     TEXT,
      add_on                    TEXT,
      sft                       REAL    DEFAULT 0,
      proposal_sent             TEXT,
      purchase_order_issued     TEXT,
      e57_issued_date           TEXT,
      start_date                TEXT,
      end_date                  TEXT,
      expected_delivery_date    TEXT,
      cost                      REAL    DEFAULT 0,
      currency                  TEXT    DEFAULT 'USD',
      billing                   TEXT,
      billing_status            TEXT,
      invoice_number            TEXT,
      invoice_date              TEXT,
      invoice_due_date          TEXT,
      payment                   TEXT,
      workflow_status           TEXT    DEFAULT 'Yet to Award',
      comments                  TEXT,
      created_at                TEXT    DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // ── Indexes for faster lookups ──
  db.exec(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id)`);

  console.log(`[DB] SQLite database initialized at ${DB_PATH}`);
  return db;
}

// ──────────────────────────────────────────────
//  USER OPERATIONS
// ──────────────────────────────────────────────

export interface UserRow {
  id: number;
  username: string;
  password: string;
  email: string;
  role: string;
  created_at: string;
}

/** Create a new user. Password is hashed with scrypt before storage. Returns the inserted user row. */
export function createUser(username: string, password: string, email: string): UserRow {
  ensureDb();
  const hashed = hashPassword(password);
  const stmt = db.prepare(
    `INSERT INTO users (username, password, email) VALUES (?, ?, ?)`
  );
  const result = stmt.run(username, hashed, email);
  return getUserById(result.lastInsertRowid as number)!;
}

/** Find a user by username. */
export function getUserByUsername(username: string): UserRow | undefined {
  ensureDb();
  return db.prepare(`SELECT * FROM users WHERE username = ?`).get(username) as UserRow | undefined;
}

/** Find a user by email. */
export function getUserByEmail(email: string): UserRow | undefined {
  ensureDb();
  return db.prepare(`SELECT * FROM users WHERE email = ?`).get(email) as UserRow | undefined;
}

/** Find a user by id. */
export function getUserById(id: number): UserRow | undefined {
  ensureDb();
  return db.prepare(`SELECT * FROM users WHERE id = ?`).get(id) as UserRow | undefined;
}

/** Get all users (passwords excluded for safety). */
export function getAllUsers(): Omit<UserRow, 'password'>[] {
  ensureDb();
  return db.prepare(`SELECT id, username, email, role, created_at FROM users`).all() as Omit<UserRow, 'password'>[];
}

/**
 * Authenticate a user by username or email with plaintext password.
 * Returns the user row (without password) on success, or null on failure.
 */
export function authenticateUser(login: string, password: string): Omit<UserRow, 'password'> | null {
  ensureDb();
  let user = getUserByUsername(login);
  if (!user && login.includes('@')) {
    user = getUserByEmail(login);
  }
  if (!user) return null;
  if (!verifyPassword(password, user.password)) return null;
  // Return user without password
  const { password: _pw, ...safe } = user;
  return safe;
}

// ──────────────────────────────────────────────
//  PROJECT OPERATIONS
// ──────────────────────────────────────────────

export interface ProjectRow {
  id: number;
  user_id: number;
  project_no: string;
  client: string;
  project_name: string;
  building_type: string;
  description: string;
  requirements: string;
  scope: string;
  lod: string;
  scale: string;
  add_on: string;
  sft: number;
  proposal_sent: string;
  purchase_order_issued: string;
  e57_issued_date: string;
  start_date: string;
  end_date: string;
  expected_delivery_date: string;
  cost: number;
  currency: string;
  billing: string;
  billing_status: string;
  invoice_number: string;
  invoice_date: string;
  invoice_due_date: string;
  payment: string;
  workflow_status: string;
  comments: string;
  created_at: string;
}

export interface CreateProjectInput {
  project_no?: string;
  client?: string;
  project_name: string;
  building_type?: string;
  description?: string;
  requirements?: string;
  scope?: string;
  lod?: string;
  scale?: string;
  add_on?: string;
  sft?: number;
  proposal_sent?: string;
  purchase_order_issued?: string;
  e57_issued_date?: string;
  start_date?: string;
  end_date?: string;
  expected_delivery_date?: string;
  cost?: number;
  currency?: string;
  billing?: string;
  billing_status?: string;
  invoice_number?: string;
  invoice_date?: string;
  invoice_due_date?: string;
  payment?: string;
  workflow_status?: string;
  comments?: string;
}

/** Create a new project associated with a user. Returns the inserted row. */
export function createProject(userId: number, input: CreateProjectInput): ProjectRow {
  ensureDb();
  const stmt = db.prepare(`
    INSERT INTO projects (
      user_id, project_no, client, project_name, building_type, description,
      requirements, scope, lod, scale, add_on, sft,
      proposal_sent, purchase_order_issued, e57_issued_date,
      start_date, end_date, expected_delivery_date,
      cost, currency, billing, billing_status, invoice_number,
      invoice_date, invoice_due_date, payment, workflow_status, comments
    ) VALUES (
      @user_id, @project_no, @client, @project_name, @building_type, @description,
      @requirements, @scope, @lod, @scale, @add_on, @sft,
      @proposal_sent, @purchase_order_issued, @e57_issued_date,
      @start_date, @end_date, @expected_delivery_date,
      @cost, @currency, @billing, @billing_status, @invoice_number,
      @invoice_date, @invoice_due_date, @payment, @workflow_status, @comments
    )
  `);

  const result = stmt.run({
    user_id: userId,
    project_no: input.project_no || null,
    client: input.client || null,
    project_name: input.project_name,
    building_type: input.building_type || null,
    description: input.description || null,
    requirements: input.requirements || null,
    scope: input.scope || null,
    lod: input.lod || null,
    scale: input.scale || null,
    add_on: input.add_on || null,
    sft: input.sft || 0,
    proposal_sent: input.proposal_sent || null,
    purchase_order_issued: input.purchase_order_issued || null,
    e57_issued_date: input.e57_issued_date || null,
    start_date: input.start_date || null,
    end_date: input.end_date || null,
    expected_delivery_date: input.expected_delivery_date || null,
    cost: input.cost || 0,
    currency: input.currency || 'USD',
    billing: input.billing || null,
    billing_status: input.billing_status || null,
    invoice_number: input.invoice_number || null,
    invoice_date: input.invoice_date || null,
    invoice_due_date: input.invoice_due_date || null,
    payment: input.payment || null,
    workflow_status: input.workflow_status || 'Yet to Award',
    comments: input.comments || null,
  });

  return getProjectById(result.lastInsertRowid as number)!;
}

/** Get all projects for a specific user. */
export function getUserProjects(userId: number): ProjectRow[] {
  ensureDb();
  return db.prepare(`SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC`).all(userId) as ProjectRow[];
}

/** Get a single project by id. */
export function getProjectById(id: number): ProjectRow | undefined {
  ensureDb();
  return db.prepare(`SELECT * FROM projects WHERE id = ?`).get(id) as ProjectRow | undefined;
}

/** Get all projects across all users (admin use). */
export function getAllProjects(): ProjectRow[] {
  ensureDb();
  return db.prepare(`SELECT * FROM projects ORDER BY created_at DESC`).all() as ProjectRow[];
}

// ──────────────────────────────────────────────
//  VALIDATION / INSPECTION
// ──────────────────────────────────────────────

export interface ValidationResult {
  database_path: string;
  tables: {
    name: string;
    columns: { name: string; type: string; notnull: boolean; pk: boolean }[];
    row_count: number;
  }[];
  users: Omit<UserRow, 'password'>[];
  projects: ProjectRow[];
  errors: string[];
}

/** Validate the database by checking table structure and returning all records. */
export function validateDatabase(): ValidationResult {
  ensureDb();

  const errors: string[] = [];

  // Get table info
  const tableNames: { name: string }[] = db.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`
  ).all() as { name: string }[];

  if (tableNames.length === 0) {
    errors.push('No user tables found in the database.');
  }

  const tables = tableNames.map(t => {
    const columns: { name: string; type: string; notnull: boolean; pk: boolean }[] = db.prepare(
      `PRAGMA table_info(${t.name})`
    ).all() as { name: string; type: string; notnull: boolean; pk: boolean }[];

    const rowCountResult: { count: number } = db.prepare(
      `SELECT COUNT(*) as count FROM "${t.name}"`
    ).get() as { count: number };

    // Validate expected tables exist
    if (t.name === 'users') {
      const expected = ['id', 'username', 'password', 'email', 'role', 'created_at'];
      const missing = expected.filter(e => !columns.find(c => c.name === e));
      if (missing.length) errors.push(`Table 'users' is missing columns: ${missing.join(', ')}`);
    }
    if (t.name === 'projects') {
      const expected = ['id', 'user_id', 'project_name', 'cost', 'currency', 'workflow_status'];
      const missing = expected.filter(e => !columns.find(c => c.name === e));
      if (missing.length) errors.push(`Table 'projects' is missing columns: ${missing.join(', ')}`);
    }

    return {
      name: t.name,
      columns: columns.map(c => ({
        name: c.name,
        type: c.type,
        notnull: !!c.notnull,
        pk: !!c.pk,
      })),
      row_count: rowCountResult.count,
    };
  });

  // Get all users (without passwords)
  const users = getAllUsers();

  // Get all projects
  const projects = getAllProjects();

  // Validate foreign key references
  for (const p of projects) {
    const userExists = users.find(u => u.id === p.user_id);
    if (!userExists) {
      errors.push(`Project id=${p.id} references user_id=${p.user_id} which does not exist.`);
    }
  }

  return {
    database_path: DB_PATH,
    tables,
    users,
    projects,
    errors,
  };
}

function ensureDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
}

// ──────────────────────────────────────────────
//  SEED DEFAULT USERS
// ──────────────────────────────────────────────

/** Default users to seed into the database (matching the original hardcoded users array). */
const DEFAULT_USERS = [
  { username: 'clove', password: '123', email: 'clove@example.com', role: 'admin' },
  { username: 'user', password: '123', email: 'user@example.com', role: 'user' },
  { username: 'engineer', password: 'bimiq2026', email: 'engineer@axisxd.com', role: 'admin' },
];

/**
 * Seed default users into the database if no users exist yet.
 * This ensures the original hardcoded demo users are always available.
 */
export function seedDefaultUsers(): void {
  ensureDb();

  const existingCount = db.prepare(`SELECT COUNT(*) as count FROM users`).get() as { count: number };
  if (existingCount.count > 0) {
    console.log(`[DB] Seed skipped — ${existingCount.count} users already exist.`);
    return;
  }

  console.log('[DB] Seeding default users...');
  const insert = db.prepare(`INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)`);

  for (const u of DEFAULT_USERS) {
    const hashed = hashPassword(u.password);
    try {
      insert.run(u.username, hashed, u.email, u.role);
      console.log(`[DB] Seeded user: ${u.username} (${u.email})`);
    } catch (err) {
      console.warn(`[DB] Failed to seed user ${u.username}:`, err);
    }
  }

  const total = db.prepare(`SELECT COUNT(*) as count FROM users`).get() as { count: number };
  console.log(`[DB] Seeding complete — ${total.count} users in database.`);
}

export default { initDatabase, createUser, getUserByUsername, getUserByEmail, getUserById, getAllUsers, createProject, getUserProjects, getProjectById, getAllProjects, validateDatabase, authenticateUser, hashPassword, verifyPassword, seedDefaultUsers };
