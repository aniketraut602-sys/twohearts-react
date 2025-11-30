const { getDb } = require('../db/db');

const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createPrefsTable = `
CREATE TABLE IF NOT EXISTS prefs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  theme TEXT DEFAULT 'light',
  font_size INTEGER DEFAULT 16,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
`;

const createEventsTable = `
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  payload TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

function migrate() {
  const db = getDb();
  try {
    db.exec(createUsersTable);
    console.log(createUsersTable);
    db.exec(createPrefsTable);
    console.log(createPrefsTable);
    db.exec(createEventsTable);
    console.log(createEventsTable);
    console.log('Migrations completed successfully.');
  } catch (err) {
    console.error('Error running migrations:', err);
  }
}

if (require.main === module) {
  migrate();
}

module.exports = migrate;