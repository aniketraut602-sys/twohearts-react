const { getDb } = require('../db/db');
const { getIO } = require('../socket');

// In-memory map to track scheduled deletions (optional, for cancellation if needed)
// For a simple implementation, we just fire and forget the setTimeout
// Note: This is not persistent across server restarts. 
// For production robustness without Redis, we would need a startup check to process missed deletions.

const scheduleDeletion = (messageId, chatId) => {
    // Delete after 5 seconds (5000 ms)
    setTimeout(async () => {
        try {
            const db = getDb();

            // Update the message in the database
            const stmt = db.prepare(
                'UPDATE messages SET deleted_for_recipient_at = CURRENT_TIMESTAMP WHERE id = ?'
            );
            const result = stmt.run(messageId);

            if (result.changes > 0) {
                // Notify the chat room via Socket.IO
                try {
                    const io = getIO();
                    io.to(`chat_${chatId}`).emit('messageDeleted', { messageId });
                    console.log(`Message ${messageId} marked for deletion.`);
                } catch (socketError) {
                    console.error('Socket.IO error during deletion notification:', socketError);
                }
            }
        } catch (error) {
            console.error(`Failed to process deletion for message ${messageId}:`, error);
        }
    }, 5000);
};

module.exports = { scheduleDeletion };
