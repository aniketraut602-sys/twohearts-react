const betterSqlite3 = require('better-sqlite3');

let db;

function init() {
  const dbPath = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.startsWith('sqlite:')
      ? process.env.DATABASE_URL.substring(7)
      : process.env.DATABASE_URL
    : ':memory:';

  db = new betterSqlite3(dbPath, { verbose: console.log });
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON'); // Enable foreign key constraints

  // Run migrations
  const { runMigrations } = require('./migrations');
  try {
    runMigrations();
  } catch (error) {
    console.error('Failed to run migrations:', error);
    process.exit(1);
  }

  return db;
}

function getDb() {
  if (!db) {
    return init();
  }
  return db;
}

function close() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  init,
  getDb,
  close,
};