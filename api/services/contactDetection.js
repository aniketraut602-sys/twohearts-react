const { getDb } = require('../db/db');

const PHONE_REGEX = /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;

async function detectAndLogContact(userId, messageId, content) {
    const matches = content.match(PHONE_REGEX);
    if (!matches) {
        return null;
    }

    const detectedContact = matches[0];
    const db = getDb();

    try {
        // Log the incident
        const stmt = db.prepare(
            'INSERT INTO incidents (user_id, message_id, detected_contact) VALUES (?, ?, ?)'
        );
        const result = stmt.run(userId, messageId, detectedContact);
        const incidentId = result.lastInsertRowid;

        // --- Threshold Enforcement Logic ---
        const countStmt = db.prepare('SELECT COUNT(*) as count FROM incidents WHERE user_id = ?');
        const countResult = countStmt.get(userId);
        const incidentCount = countResult.count;

        if (incidentCount === 4) {
            // SCEN-0004: 4th violation - Send warning
            console.log(`User ${userId} has 4 violations. Sending warning.`);
            // In a real app, we'd emit a socket event here if we had the socket instance or user's socket ID mapped
        } else if (incidentCount === 5) {
            // SCEN-0005: 5th violation - Flag user account
            console.log(`User ${userId} has 5 violations. Flagging account.`);
            db.prepare('UPDATE users SET is_flagged = 1 WHERE id = ?').run(userId);
        } else if (incidentCount >= 6) {
            // SCEN-0006: 6th+ violation - Temp-block user
            console.log(`User ${userId} has 6+ violations. Blocking account.`);
            db.prepare('UPDATE users SET is_blocked = 1 WHERE id = ?').run(userId);
        }

        return { id: incidentId };
    } catch (error) {
        console.error('Error logging contact detection incident:', error);
        return null;
    }
}

module.exports = { detectAndLogContact };
