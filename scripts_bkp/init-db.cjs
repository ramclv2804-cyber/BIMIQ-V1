const Database = require('better-sqlite3');
const { join } = require('path');
const { existsSync, unlinkSync } = require('fs');

const dbPath = process.env.DB_PATH || join(__dirname, '..', 'src', 'database.db');

// Remove old database if it exists
if (existsSync(dbPath)) {
  unlinkSync(dbPath);
  console.log('Removed old database.db');
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Users table with CURRENT_TIMESTAMP (SQLite constant expression)
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
console.log('Created users table');

// Projects table
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
console.log('Created projects table');

// Indexes
db.exec('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
db.exec('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
db.exec('CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id)');
console.log('Created indexes');

// Tables and structure
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
console.log('Tables:', tables.map(t => t.name).join(', '));

// Column info for each table
for (const t of tables) {
  const cols = db.prepare(`PRAGMA table_info(${t.name})`).all();
  console.log(`\n${t.name} columns:`);
  for (const c of cols) {
    console.log(`  ${c.name} (${c.type}) ${c.pk ? 'PK' : ''} ${c.notnull ? 'NN' : ''}`);
  }
}

const stats = require('fs').statSync(dbPath);
console.log(`\nDatabase file: ${dbPath}`);
console.log(`Size: ${(stats.size / 1024).toFixed(1)} KB`);

// Seed default users
const { scryptSync, randomBytes } = require('crypto');
// const defaultUsers = [
//   { username: 'clove', password: '123', email: 'clove@example.com', role: 'admin' },
//   { username: 'user', password: '123', email: 'user@example.com', role: 'user' },
//   { username: 'engineer', password: 'bimiq2026', email: 'engineer@axisxd.com', role: 'admin' },
// ];

// const insertUser = db.prepare('INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)');

// for (const u of defaultUsers) {
//   const salt = randomBytes(16).toString('hex');
//   const derivedKey = scryptSync(u.password, salt, 64);
//   const hashed = `${salt}:${derivedKey.toString('hex')}`;
//   insertUser.run(u.username, hashed, u.email, u.role);
//   console.log(`Seeded user: ${u.username} (${u.email})`);
// }

const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
console.log(`\nTotal users: ${userCount.count}`);
console.log('\ndatabase.db created and seeded successfully!');

db.close();
