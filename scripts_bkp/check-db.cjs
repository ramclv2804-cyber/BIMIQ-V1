const Database = require('better-sqlite3');
const { join } = require('path');
const dbPath = process.env.DB_PATH || join(__dirname, '..', 'src', 'database.db');
const db = new Database(dbPath);
console.log('Database:', dbPath);

console.log('=== TABLES ===');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
tables.forEach(t => console.log(' -', t.name));

console.log('\n=== USERS ===');
const users = db.prepare('SELECT id, username, email, role, created_at FROM users').all();
console.log('Count:', users.length);
users.forEach(u => console.log(`  [${u.id}] ${u.username} (${u.email}) - ${u.role} - created: ${u.created_at}`));

console.log('\n=== PROJECTS ===');
const projects = db.prepare('SELECT id, user_id, project_name, created_at FROM projects').all();
console.log('Count:', projects.length);
projects.forEach(p => console.log(`  [${p.id}] user=${p.user_id} - ${p.project_name} - created: ${p.created_at}`));

db.close();
