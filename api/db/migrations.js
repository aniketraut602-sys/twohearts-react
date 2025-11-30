const { getDb } = require('./db');
const fs = require('fs');
const path = require('path');

/**
 * Run database migrations
 * This ensures all tables and columns exist
 */
function runMigrations() {
  const db = getDb();

  console.log('Running database migrations...');

  try {
    // Start transaction
    db.exec('BEGIN TRANSACTION');

    // Migration 0: Create users table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migration 1: Add profile fields to users table
    const userColumns = db.prepare("PRAGMA table_info(users)").all();
    const existingColumns = userColumns.map(col => col.name);

    const profileFields = [
      { name: 'name', type: 'TEXT' },
      { name: 'bio', type: 'TEXT' },
      { name: 'interests', type: 'TEXT' },
      { name: 'seeking', type: 'TEXT' },
      { name: 'age', type: 'INTEGER' },
      { name: 'location', type: 'TEXT' },
      { name: 'last_seen', type: 'DATETIME' }
    ];

    profileFields.forEach(field => {
      if (!existingColumns.includes(field.name)) {
        console.log(`Adding column ${field.name} to users table`);
        db.exec(`ALTER TABLE users ADD COLUMN ${field.name} ${field.type}`);
      }
    });

    // Migration 1.1: Add flags to users table
    const userFlags = [
      { name: 'is_flagged', type: 'BOOLEAN DEFAULT 0' },
      { name: 'is_blocked', type: 'BOOLEAN DEFAULT 0' }
    ];

    userFlags.forEach(field => {
      if (!existingColumns.includes(field.name)) {
        console.log(`Adding column ${field.name} to users table`);
        db.exec(`ALTER TABLE users ADD COLUMN ${field.name} ${field.type}`);
      }
    });

    // Migration 2: Create connections table
    db.exec(`
      CREATE TABLE IF NOT EXISTS connections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        requester_id INTEGER NOT NULL,
        recipient_id INTEGER NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(requester_id, recipient_id)
      )
    `);

    // Migration 3: Create chat_rooms table
    db.exec(`
      CREATE TABLE IF NOT EXISTS chat_rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user1_id INTEGER NOT NULL,
        user2_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
        CHECK(user1_id < user2_id),
        UNIQUE(user1_id, user2_id)
      )
    `);

    // Migration 4: Create messages table
    db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_room_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME,
        deleted_for_recipient_at DATETIME,
        FOREIGN KEY (chat_room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Migration 5: Create message_read_receipts table
    db.exec(`
      CREATE TABLE IF NOT EXISTS message_read_receipts (
        message_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (message_id, user_id),
        FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
      )
    `);

    // Migration 5.1: Add deleted_for_recipient_at to messages if not exists
    const messageColumns = db.prepare("PRAGMA table_info(messages)").all();
    const messageColNames = messageColumns.map(col => col.name);
    if (!messageColNames.includes('deleted_for_recipient_at')) {
      console.log('Adding column deleted_for_recipient_at to messages table');
      db.exec('ALTER TABLE messages ADD COLUMN deleted_for_recipient_at DATETIME');
    }

    // Migration 5.2: Create incidents table
    db.exec(`
      CREATE TABLE IF NOT EXISTS incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        message_id INTEGER NOT NULL,
        detected_contact TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
      )
    `);

    // Migration 6: Create indexes for performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_connections_requester ON connections(requester_id)',
      'CREATE INDEX IF NOT EXISTS idx_connections_recipient ON connections(recipient_id)',
      'CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status)',
      'CREATE INDEX IF NOT EXISTS idx_connections_requester_status ON connections(requester_id, status)',
      'CREATE INDEX IF NOT EXISTS idx_connections_recipient_status ON connections(recipient_id, status)',
      'CREATE INDEX IF NOT EXISTS idx_chat_rooms_user1 ON chat_rooms(user1_id)',
      'CREATE INDEX IF NOT EXISTS idx_chat_rooms_user2 ON chat_rooms(user2_id)',
      'CREATE INDEX IF NOT EXISTS idx_chat_rooms_created ON chat_rooms(created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_messages_chat_room ON messages(chat_room_id)',
      'CREATE INDEX IF NOT EXISTS idx_messages_user ON messages(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_messages_chat_created ON messages(chat_room_id, created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_messages_deleted ON messages(deleted_at)',
      'CREATE INDEX IF NOT EXISTS idx_read_receipts_message ON message_read_receipts(message_id)',
      'CREATE INDEX IF NOT EXISTS idx_read_receipts_user ON message_read_receipts(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_read_receipts_composite ON message_read_receipts(message_id, user_id)',
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen)'
    ];

    indexes.forEach(indexSql => {
      db.exec(indexSql);
    });

    // Optimize database
    db.exec('ANALYZE');

    // Commit transaction
    db.exec('COMMIT');

    console.log('✓ All migrations completed successfully');
    return true;
  } catch (error) {
    // Rollback on error
    db.exec('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  }
}

module.exports = { runMigrations };
