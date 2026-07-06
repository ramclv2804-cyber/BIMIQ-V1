import Database from 'better-sqlite3';
import { join, sep } from 'node:path';
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';

function getDbPath(): string {
  // Allow override via environment variable
  if (process.env['DB_PATH']) return process.env['DB_PATH'];
   const currentDir = import.meta.dirname;
   
  debugger
  console.log(`[DB] No DB_PATH env var set. Using default path based on execution context.`,join(currentDir, '..', 'database.db'));
 

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
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      username        TEXT    NOT NULL UNIQUE,
      password        TEXT    NOT NULL,
      email           TEXT    NOT NULL UNIQUE,
      company_name    TEXT,
      company_website TEXT,
      contact_number  TEXT,
      role            TEXT    DEFAULT 'client',
      status          INTEGER DEFAULT 1,
      created_at      TEXT    DEFAULT (datetime('now', '+5 hours', '+30 minutes'))
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
      invoice_number            TEXT,
      invoice_date              TEXT,
      invoice_due_date          TEXT,
      payment                   TEXT,
      workflow_status           TEXT    DEFAULT 'Yet to Award',
      comments                  TEXT,
      remark                    TEXT,
      upload_link               TEXT,
      point_cloud_link          TEXT,
      description_link          TEXT,
      status                    INTEGER DEFAULT 1,
      created_at                TEXT    DEFAULT (datetime('now', '+5 hours', '+30 minutes')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // ── Tickets table ──
  db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id           INTEGER NOT NULL,
      project_id        INTEGER,
      project_name      TEXT,
      ticket_urls       TEXT,
      ticket_comments   TEXT,
      ticket_status     TEXT    DEFAULT '1',
      raised_by_username TEXT,
      completed_at      TEXT,
      created_at        TEXT    DEFAULT (datetime('now', '+5 hours', '+30 minutes')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
    )
  `);

  // ── Indexes for faster lookups ──
  db.exec(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_tickets_project_id ON tickets(project_id)`);

  // Migration: convert existing UTC timestamps to IST (run once)
  db.exec(`CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, run_at TEXT DEFAULT (datetime('now')))`);
  const migrated = db.prepare(`SELECT name FROM _migrations WHERE name = 'ist_timestamps'`).get();
  if (!migrated) {
    db.exec(`UPDATE projects SET created_at = datetime(created_at, '+5 hours', '+30 minutes') WHERE created_at IS NOT NULL`);
    db.exec(`UPDATE users SET created_at = datetime(created_at, '+5 hours', '+30 minutes') WHERE created_at IS NOT NULL`);
    db.prepare(`INSERT INTO _migrations (name) VALUES ('ist_timestamps')`).run();
    console.log(`[DB] Migrated existing timestamps from UTC to IST`);
  }

  // Migration: fix projects where status column has wrong values (should be 1, not 2/3/4)
  const statusFixed = db.prepare(`SELECT name FROM _migrations WHERE name = 'fix_project_status'`).get();
  if (!statusFixed) {
    const fixedCount = db.prepare(`UPDATE projects SET status = 1 WHERE status > 1`).run();
    db.prepare(`INSERT INTO _migrations (name) VALUES ('fix_project_status')`).run();
    console.log(`[DB] Fixed project status values — ${fixedCount.changes} projects updated to status=1`);
  }

  // Migration: add company_name, company_website, contact_number columns to users table
  const companyColsAdded = db.prepare(`SELECT name FROM _migrations WHERE name = 'add_company_fields_to_users'`).get();
  if (!companyColsAdded) {
    try {
      db.exec(`ALTER TABLE users ADD COLUMN company_name TEXT`);
      db.exec(`ALTER TABLE users ADD COLUMN company_website TEXT`);
      db.exec(`ALTER TABLE users ADD COLUMN contact_number TEXT`);
    } catch {
      // Columns may already exist if table was recreated
    }
    db.prepare(`INSERT INTO _migrations (name) VALUES ('add_company_fields_to_users')`).run();
    console.log(`[DB] Added company_name, company_website, contact_number columns to users table`);
  }

  // Migration: add markasread column to users table
  const markReadColAdded = db.prepare(`SELECT name FROM _migrations WHERE name = 'add_markasread_to_users'`).get();
  if (!markReadColAdded) {
    try {
      db.exec(`ALTER TABLE users ADD COLUMN markasread INTEGER DEFAULT 0`);
    } catch {
      // Column may already exist
    }
    db.prepare(`INSERT INTO _migrations (name) VALUES ('add_markasread_to_users')`).run();
    console.log(`[DB] Added markasread column to users table`);
  }

  // Migration: add completed_at column to tickets table
  const completedAtAdded = db.prepare(`SELECT name FROM _migrations WHERE name = 'add_completed_at_to_tickets'`).get();
  if (!completedAtAdded) {
    try {
      db.exec(`ALTER TABLE tickets ADD COLUMN completed_at TEXT`);
    } catch {
      // Column may already exist
    }
    db.prepare(`INSERT INTO _migrations (name) VALUES ('add_completed_at_to_tickets')`).run();
    console.log(`[DB] Added completed_at column to tickets table`);
  }

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
  company_name: string | null;
  company_website: string | null;
  contact_number: string | null;
  role: string;
  markasread: number;
  created_at: string;
}

/** Create a new user. Password is hashed with scrypt before storage. Returns the inserted user row. */
function istNow(): string {
  return new Date(Date.now() + 19800000).toISOString().replace('T', ' ').substring(0, 19);
}

export function createUser(
  username: string,
  password: string,
  email: string,
  company_name?: string,
  company_website?: string,
  contact_number?: string
): UserRow {
  ensureDb();
  const hashed = hashPassword(password);
  const stmt = db.prepare(
    `INSERT INTO users (username, password, email, company_name, company_website, contact_number, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  const result = stmt.run(username, hashed, email, company_name || null, company_website || null, contact_number || null, istNow());
  return getUserById(result.lastInsertRowid as number)!;
}

/** Find a user by username. */
export function getUserByUsername(username: string): UserRow | undefined {
  ensureDb();
  return db.prepare(`SELECT * FROM users WHERE username = ? AND status = 1`).get(username) as UserRow | undefined;
}

/** Find a user by email. */
export function getUserByEmail(email: string): UserRow | undefined {
  ensureDb();
  return db.prepare(`SELECT * FROM users WHERE email = ? AND status = 1`).get(email) as UserRow | undefined;
}

/** Find a user by id. */
export function getUserById(id: number): UserRow | undefined {
  ensureDb();
  return db.prepare(`SELECT * FROM users WHERE id = ? AND status = 1`).get(id) as UserRow | undefined;
}

/** Get all users (passwords excluded for safety). */
export function getAllUsers(): Omit<UserRow, 'password'>[] {
  ensureDb();
  return db.prepare(`SELECT id, username, email, company_name, company_website, contact_number, role, markasread, created_at FROM users WHERE status = 1`).all() as Omit<UserRow, 'password'>[];
}

/** Get new/unread users (markasread = 0). Shows all roles including admin. */
export function getNewUsers(): Omit<UserRow, 'password'>[] {
  ensureDb();
  return db.prepare(`SELECT id, username, email, company_name, company_website, contact_number, role, markasread, created_at FROM users WHERE status = 1 AND markasread = 0 ORDER BY created_at DESC`).all() as Omit<UserRow, 'password'>[];
}

/** Mark a user as read (set markasread = 1). */
export function markUserAsRead(id: number): boolean {
  ensureDb();
  const result = db.prepare(`UPDATE users SET markasread = 1 WHERE id = ? AND status = 1`).run(id);
  return result.changes > 0;
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
  invoice_number: string;
  invoice_date: string;
  invoice_due_date: string;
  payment: string;
  workflow_status: string;
  comments: string;
  remark: string;
  upload_link: string;
  point_cloud_link: string;
  description_link: string;
  status: number;
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
  invoice_number?: string;
  invoice_date?: string;
  invoice_due_date?: string;
  payment?: string;
  workflow_status?: string;
  status?: number;
  comments?: string;
  remark?: string;
  upload_link?: string;
  point_cloud_link?: string;
  description_link?: string;
}

/** Create a new project associated with a user. Returns the inserted row. */
export function createProject(userId: number, input: CreateProjectInput): ProjectRow {
  ensureDb();

  const existing = db.prepare(`
    SELECT id FROM projects WHERE user_id = ?
      AND IFNULL(client, '') = ? AND project_name = ? AND IFNULL(building_type, '') = ? AND IFNULL(description, '') = ?
      AND IFNULL(requirements, '') = ? AND IFNULL(scope, '') = ? AND IFNULL(lod, '') = ? AND IFNULL(scale, '') = ? AND IFNULL(add_on, '') = ?
      AND sft = ? AND cost = ? AND currency = ?
      AND IFNULL(billing, '') = ? AND IFNULL(payment, '') = ? AND workflow_status = ?
  `).get(
    userId,
    input.client ?? '',
    input.project_name,
    input.building_type ?? '',
    input.description ?? '',
    input.requirements ?? '',
    input.scope ?? '',
    input.lod ?? '',
    input.scale ?? '',
    input.add_on ?? '',
    input.sft || 0,
    input.cost || 0,
    input.currency || 'USD',
    input.billing ?? '',
    input.payment ?? '',
    input.workflow_status || 'Yet to Award',
  );
  if (existing) {
    throw new Error('A project with same data already exists in your projects list.');
  }

  const timestamp = istNow();
  const stmt = db.prepare(`
    INSERT INTO projects (
      user_id, project_no, client, project_name, building_type, description,
      requirements, scope, lod, scale, add_on, sft,
      proposal_sent, purchase_order_issued, e57_issued_date,
      start_date, end_date, expected_delivery_date,
      cost, currency, billing, invoice_number,
      invoice_date, invoice_due_date, payment, workflow_status,
      status, comments,
      upload_link, point_cloud_link, description_link, remark,
      created_at
    ) VALUES (
      @user_id, @project_no, @client, @project_name, @building_type, @description,
      @requirements, @scope, @lod, @scale, @add_on, @sft,
      @proposal_sent, @purchase_order_issued, @e57_issued_date,
      @start_date, @end_date, @expected_delivery_date,
      @cost, @currency, @billing, @invoice_number,
      @invoice_date, @invoice_due_date, @payment, @workflow_status,
      @status, @comments,
      @upload_link, @point_cloud_link, @description_link, @remark,
      @created_at
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
    invoice_number: input.invoice_number || null,
    invoice_date: input.invoice_date || null,
    invoice_due_date: input.invoice_due_date || null,
    payment: input.payment || null,
    workflow_status: input.workflow_status || 'Yet to Award',
    status: input.status ?? 1,
    comments: input.comments || null,
    remark: input.remark || null,
    upload_link: input.upload_link || null,
    point_cloud_link: input.point_cloud_link || null,
    description_link: input.description_link || null,
    created_at: timestamp,
  });

  return getProjectById(result.lastInsertRowid as number)!;
}

/** Get all projects for a specific user. */
export function getUserProjects(userId: number): ProjectRow[] {
  ensureDb();
  return db.prepare(`SELECT * FROM projects WHERE user_id = ? AND status > 1 ORDER BY created_at DESC`).all(userId) as ProjectRow[];
}

/** Get a single project by id. */
export function getProjectById(id: number): ProjectRow | undefined {
  ensureDb();
  return db.prepare(`SELECT * FROM projects WHERE id = ? AND status >= 1`).get(id) as ProjectRow | undefined;
}

/** Get all projects across all users (admin use). */
export function getAllProjects(): ProjectRow[] {
  ensureDb();
  return db.prepare(`SELECT * FROM projects WHERE status > 1 ORDER BY created_at DESC`).all() as ProjectRow[];
}

export interface AdminDashboardStats {
  totalProjects: number;
  totalUsers: number;
  totalCost: number;
  totalSft: number;
  statusBreakdown: { status: string; count: number; cost: number }[];
  scopeBreakdown: { scope: string; count: number }[];
  billingBreakdown: { billing: string; count: number }[];
  paymentBreakdown: { payment: string; count: number }[];
  recentProjects: (ProjectRow & { username: string })[];
  projectsPerUser: { userId: number; username: string; email: string; count: number; totalCost: number }[];
}

export function getAdminDashboardStats(): AdminDashboardStats {
  ensureDb();

  const allProjects = getAllProjects();
  const allUsers = getAllUsers();

  const statusBreakdown = db.prepare(`
    SELECT COALESCE(workflow_status, 'Yet to Award') as status, COUNT(*) as count, COALESCE(SUM(cost), 0) as cost
    FROM projects WHERE status >= 1 GROUP BY workflow_status
  `).all() as { status: string; count: number; cost: number }[];

  const scopeBreakdown = db.prepare(`
    SELECT COALESCE(scope, 'Unspecified') as scope, COUNT(*) as count
    FROM projects WHERE status >= 1 GROUP BY scope
  `).all() as { scope: string; count: number }[];

  const billingBreakdown = db.prepare(`
    SELECT COALESCE(billing, 'Unknown') as billing, COUNT(*) as count
    FROM projects WHERE status >= 1 GROUP BY billing
  `).all() as { billing: string; count: number }[];

  const paymentBreakdown = db.prepare(`
    SELECT COALESCE(payment, 'Unknown') as payment, COUNT(*) as count
    FROM projects WHERE status >= 1 GROUP BY payment
  `).all() as { payment: string; count: number }[];

  const recentProjects = db.prepare(`
    SELECT p.*, u.username FROM projects p
    JOIN users u ON u.id = p.user_id
    WHERE p.status >= 1 ORDER BY p.created_at DESC LIMIT 10
  `).all() as (ProjectRow & { username: string })[];

  const projectsPerUser = db.prepare(`
    SELECT p.user_id as userId, u.username, u.email, COUNT(*) as count, COALESCE(SUM(p.cost), 0) as totalCost
    FROM projects p JOIN users u ON u.id = p.user_id
    WHERE p.status >= 1 GROUP BY p.user_id ORDER BY count DESC
  `).all() as { userId: number; username: string; email: string; count: number; totalCost: number }[];

  return {
    totalProjects: allProjects.length,
    totalUsers: allUsers.filter(u => u.role === 'client').length,
    totalCost: allProjects.reduce((s, p) => s + p.cost, 0),
    totalSft: allProjects.reduce((s, p) => s + p.sft, 0),
    statusBreakdown,
    scopeBreakdown,
    billingBreakdown,
    paymentBreakdown,
    recentProjects,
    projectsPerUser,
  };
}

// ──────────────────────────────────────────────
//  TICKET OPERATIONS
// ──────────────────────────────────────────────

export interface TicketRow {
  id: number;
  user_id: number;
  project_id: number | null;
  project_name: string;
  ticket_urls: string;
  ticket_comments: string;
  ticket_status: string;
  raised_by_username: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface CreateTicketInput {
  project_id?: number;
  project_name?: string;
  ticket_urls?: string;
  ticket_comments?: string;
  ticket_status?: string;
  raised_by_username?: string;
}

/** Create a new ticket associated with a user. */
export function createTicket(userId: number, input: CreateTicketInput): TicketRow {
  ensureDb();
  const stmt = db.prepare(`
    INSERT INTO tickets (user_id, project_id, project_name, ticket_urls, ticket_comments, ticket_status, raised_by_username)
    VALUES (@user_id, @project_id, @project_name, @ticket_urls, @ticket_comments, @ticket_status, @raised_by_username)
  `);
  const result = stmt.run({
    user_id: userId,
    project_id: input.project_id || null,
    project_name: input.project_name || null,
    ticket_urls: input.ticket_urls || null,
    ticket_comments: input.ticket_comments || null,
    ticket_status: input.ticket_status || '1',
    raised_by_username: input.raised_by_username || null,
  });
  return getTicketById(result.lastInsertRowid as number)!;
}

/** Get a single ticket by id. */
export function getTicketById(id: number): TicketRow | undefined {
  ensureDb();
  return db.prepare(`SELECT * FROM tickets WHERE id = ?`).get(id) as TicketRow | undefined;
}

/** Get all tickets for a specific project, optionally filtered by ticket_status. */
export function getProjectTickets(projectId: number, status?: string): TicketRow[] {
  ensureDb();
  if (status) {
    return db.prepare(`SELECT * FROM tickets WHERE project_id = ? AND ticket_status = ? ORDER BY created_at DESC`).all(projectId, status) as TicketRow[];
  }
  return db.prepare(`SELECT * FROM tickets WHERE project_id = ? ORDER BY created_at DESC`).all(projectId) as TicketRow[];
}

/** Get all tickets for a specific user. */
export function getUserTickets(userId: number): TicketRow[] {
  ensureDb();
  return db.prepare(`SELECT * FROM tickets WHERE user_id = ? ORDER BY created_at DESC`).all(userId) as TicketRow[];
}

/** Get all tickets across all users (admin use). */
export function getAllTickets(): TicketRow[] {
  ensureDb();
  return db.prepare(`SELECT * FROM tickets ORDER BY created_at DESC`).all() as TicketRow[];
}

/** Update a project's workflow status and sync the numeric status column. */
export function updateProjectWorkflowStatus(id: number, workflowStatus: string, numericStatus?: number): ProjectRow | undefined {
  ensureDb();
  if (numericStatus !== undefined) {
    db.prepare(`UPDATE projects SET workflow_status = ?, status = ? WHERE id = ? AND status >= 1`).run(workflowStatus, numericStatus, id);
  } else {
    // Auto-map: 'Yet to Award' → 1, 'In Progress' → 2, 'Under Revision' → 3, 'Completed' → 4
    const statusMap: Record<string, number> = {
      'Yet to Award': 1,
      'In Progress': 2,
      'Under Revision': 3,
      'Completed': 4,
    };
    const mappedStatus = statusMap[workflowStatus] ?? 1;
    db.prepare(`UPDATE projects SET workflow_status = ?, status = ? WHERE id = ? AND status >= 1`).run(workflowStatus, mappedStatus, id);
  }
  return getProjectById(id);
}

/** Update a ticket's status. Sets completed_at when status='2', clears it otherwise. */
export function updateTicketStatus(id: number, status: string): TicketRow | undefined {
  ensureDb();
  if (status === '2') {
    db.prepare(`UPDATE tickets SET ticket_status = ?, completed_at = ? WHERE id = ?`).run(status, istNow(), id);
  } else {
    db.prepare(`UPDATE tickets SET ticket_status = ?, completed_at = NULL WHERE id = ?`).run(status, id);
  }
  return getTicketById(id);
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
  // { username: 'engineer', password: 'bimiq2026', email: 'engineer@axisxd.com', role: 'admin' },
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

export default { initDatabase, createUser, getUserByUsername, getUserByEmail, getUserById, getAllUsers, getNewUsers, markUserAsRead, createProject, getUserProjects, getProjectById, getAllProjects, getAdminDashboardStats, validateDatabase, authenticateUser, hashPassword, verifyPassword, seedDefaultUsers, createTicket, getTicketById, getProjectTickets, getUserTickets, getAllTickets, updateTicketStatus, updateProjectWorkflowStatus };
