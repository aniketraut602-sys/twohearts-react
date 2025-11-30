const { getDb } = require('./db');

/**
 * Add performance indexes to database
 * Optimizes queries for 1000-50000 concurrent users
 */
function addPerformanceIndexes() {
    const db = getDb();

    console.log('Adding performance indexes...');

    try {
        db.exec('BEGIN TRANSACTION');

        // User lookups - frequently queried
        db.exec('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
        db.exec('CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen)');
        db.exec('CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at)');

        // Connection queries - composite indexes for complex queries
        db.exec('CREATE INDEX IF NOT EXISTS idx_connections_requester_status ON connections(requester_id, status)');
        db.exec('CREATE INDEX IF NOT EXISTS idx_connections_recipient_status ON connections(recipient_id, status)');
        db.exec('CREATE INDEX IF NOT EXISTS idx_connections_status_created ON connections(status, created_at DESC)');

        // Chat room queries - optimized for user lookups
        db.exec('CREATE INDEX IF NOT EXISTS idx_chat_rooms_user1 ON chat_rooms(user1_id)');
        db.exec('CREATE INDEX IF NOT EXISTS idx_chat_rooms_user2 ON chat_rooms(user2_id)');
        db.exec('CREATE INDEX IF NOT EXISTS idx_chat_rooms_created ON chat_rooms(created_at DESC)');

        // Message queries - critical for chat performance
        db.exec('CREATE INDEX IF NOT EXISTS idx_messages_chat_created ON messages(chat_room_id, created_at DESC)');
        db.exec('CREATE INDEX IF NOT EXISTS idx_messages_user_created ON messages(user_id, created_at DESC)');
        db.exec('CREATE INDEX IF NOT EXISTS idx_messages_deleted ON messages(deleted_at)');

        // Read receipts - optimized for unread count queries
        db.exec('CREATE INDEX IF NOT EXISTS idx_read_receipts_message ON message_read_receipts(message_id)');
        db.exec('CREATE INDEX IF NOT EXISTS idx_read_receipts_user ON message_read_receipts(user_id)');
        db.exec('CREATE INDEX IF NOT EXISTS idx_read_receipts_composite ON message_read_receipts(message_id, user_id)');

        db.exec('COMMIT');

        console.log('✓ Performance indexes added successfully');
        return true;
    } catch (error) {
        db.exec('ROLLBACK');
        console.error('Failed to add performance indexes:', error);
        throw error;
    }
}

/**
 * Analyze database and update statistics
 * Helps query optimizer make better decisions
 */
function optimizeDatabase() {
    const db = getDb();

    console.log('Optimizing database...');

    try {
        // Analyze all tables to update statistics
        db.exec('ANALYZE');

        // Vacuum to reclaim space and defragment
        db.exec('VACUUM');

        console.log('✓ Database optimized successfully');
        return true;
    } catch (error) {
        console.error('Failed to optimize database:', error);
        throw error;
    }
}

module.exports = {
    addPerformanceIndexes,
    optimizeDatabase
};
