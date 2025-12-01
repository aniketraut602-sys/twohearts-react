const express = require('express');
const router = express.Router();
const { getDb } = require('../db/db');
const auth = require('../middleware/auth');
const { getIO } = require('../socket');
const { messageLimiter } = require('../middleware/rateLimiter');

// Get recent global messages
router.get('/', auth, (req, res) => {
    try {
        const db = getDb();
        const limit = 50; // Always fetch last 50 messages

        const messages = db.prepare(`
            SELECT 
                gm.id,
                gm.user_id,
                gm.content,
                gm.created_at,
                u.name as user_name,
                u.email as user_email
            FROM global_messages gm
            JOIN users u ON gm.user_id = u.id
            ORDER BY gm.created_at DESC
            LIMIT ?
        `).all(limit);

        // Reverse to show oldest first (chat order)
        const formatted = messages.reverse().map(msg => ({
            id: msg.id,
            user: {
                id: msg.user_id,
                name: msg.user_name || msg.user_email,
                email: msg.user_email
            },
            content: msg.content,
            created_at: msg.created_at
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching global messages:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Send global message
router.post('/', auth, messageLimiter, (req, res) => {
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim() === '') {
        return res.status(400).json({ message: 'Message content is required' });
    }

    try {
        const db = getDb();

        // Insert message
        const stmt = db.prepare(
            'INSERT INTO global_messages (user_id, content) VALUES (?, ?)'
        );
        const result = stmt.run(userId, content);

        // Get user details for the emitted message
        const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(userId);

        const message = {
            id: result.lastInsertRowid,
            user: {
                id: user.id,
                name: user.name || user.email,
                email: user.email
            },
            content: content,
            created_at: new Date().toISOString()
        };

        // Emit to all connected clients
        try {
            const io = getIO();
            io.emit('globalMessage', message);
        } catch (socketError) {
            console.error('Socket.IO error:', socketError);
        }

        res.status(201).json(message);
    } catch (error) {
        console.error('Error sending global message:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
