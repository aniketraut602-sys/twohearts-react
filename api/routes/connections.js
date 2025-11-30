const express = require('express');
const router = express.Router();
const { getDb } = require('../db/db');
const auth = require('../middleware/auth');
const { connectionLimiter } = require('../middleware/rateLimiter');

// Send connection request (with rate limiting)
router.post('/request', auth, connectionLimiter, async (req, res) => {
    const { recipientId } = req.body;
    const requesterId = req.user.id;

    if (!recipientId) {
        return res.status(400).json({ message: 'Recipient ID is required' });
    }

    if (recipientId === requesterId) {
        return res.status(400).json({ message: 'Cannot connect with yourself' });
    }

    try {
        const db = getDb();

        // Check if connection already exists
        const existing = db.prepare(
            'SELECT * FROM connections WHERE (requester_id = ? AND recipient_id = ?) OR (requester_id = ? AND recipient_id = ?)'
        ).get(requesterId, recipientId, recipientId, requesterId);

        if (existing) {
            return res.status(409).json({ message: 'Connection request already exists', status: existing.status });
        }

        // Create connection request
        const stmt = db.prepare(
            'INSERT INTO connections (requester_id, recipient_id, status) VALUES (?, ?, ?)'
        );
        const result = stmt.run(requesterId, recipientId, 'pending');

        res.status(201).json({
            id: result.lastInsertRowid,
            status: 'pending',
            message: 'Connection request sent successfully'
        });
    } catch (error) {
        console.error('Error creating connection request:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get pending connection requests (received)
router.get('/pending', auth, async (req, res) => {
    try {
        const db = getDb();
        const userId = req.user.id;

        const requests = db.prepare(`
      SELECT c.id, c.requester_id, c.created_at, c.status,
             u.id as user_id, u.name, u.email, u.bio
      FROM connections c
      JOIN users u ON c.requester_id = u.id
      WHERE c.recipient_id = ? AND c.status = 'pending'
      ORDER BY c.created_at DESC
    `).all(userId);

        const formatted = requests.map(r => ({
            id: r.id,
            requester: {
                id: r.user_id,
                name: r.name || r.email,
                email: r.email,
                bio: r.bio
            },
            created_at: r.created_at,
            status: r.status
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching pending requests:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Accept connection request
router.post('/accept/:id', auth, async (req, res) => {
    const connectionId = req.params.id;
    const userId = req.user.id;

    try {
        const db = getDb();

        // Get connection
        const connection = db.prepare('SELECT * FROM connections WHERE id = ?').get(connectionId);

        if (!connection) {
            return res.status(404).json({ message: 'Connection request not found' });
        }

        if (connection.recipient_id !== userId) {
            return res.status(403).json({ message: 'Not authorized to accept this request' });
        }

        if (connection.status !== 'pending') {
            return res.status(400).json({ message: 'Connection request already processed' });
        }

        // Update connection status
        db.prepare('UPDATE connections SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .run('accepted', connectionId);

        // Create chat room (ensure user1_id < user2_id for uniqueness)
        const user1 = Math.min(connection.requester_id, connection.recipient_id);
        const user2 = Math.max(connection.requester_id, connection.recipient_id);

        const chatRoomStmt = db.prepare(
            'INSERT OR IGNORE INTO chat_rooms (user1_id, user2_id) VALUES (?, ?)'
        );
        const chatRoomResult = chatRoomStmt.run(user1, user2);

        // Get the chat room ID
        const chatRoom = db.prepare(
            'SELECT id FROM chat_rooms WHERE user1_id = ? AND user2_id = ?'
        ).get(user1, user2);

        res.json({
            message: 'Connection accepted successfully',
            chatRoomId: chatRoom.id
        });
    } catch (error) {
        console.error('Error accepting connection:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Reject connection request
router.post('/reject/:id', auth, async (req, res) => {
    const connectionId = req.params.id;
    const userId = req.user.id;

    try {
        const db = getDb();

        // Get connection
        const connection = db.prepare('SELECT * FROM connections WHERE id = ?').get(connectionId);

        if (!connection) {
            return res.status(404).json({ message: 'Connection request not found' });
        }

        if (connection.recipient_id !== userId) {
            return res.status(403).json({ message: 'Not authorized to reject this request' });
        }

        if (connection.status !== 'pending') {
            return res.status(400).json({ message: 'Connection request already processed' });
        }

        // Update connection status
        db.prepare('UPDATE connections SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .run('rejected', connectionId);

        res.json({ message: 'Connection rejected' });
    } catch (error) {
        console.error('Error rejecting connection:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all connections (accepted)
router.get('/list', auth, async (req, res) => {
    try {
        const db = getDb();
        const userId = req.user.id;

        const connections = db.prepare(`
      SELECT c.id, c.requester_id, c.recipient_id, c.status, c.created_at,
             u.id as other_user_id, u.name, u.email, u.bio
      FROM connections c
      JOIN users u ON (CASE 
        WHEN c.requester_id = ? THEN c.recipient_id 
        ELSE c.requester_id 
      END) = u.id
      WHERE (c.requester_id = ? OR c.recipient_id = ?) AND c.status = 'accepted'
      ORDER BY c.created_at DESC
    `).all(userId, userId, userId);

        const formatted = connections.map(c => ({
            id: c.id,
            user: {
                id: c.other_user_id,
                name: c.name || c.email,
                email: c.email,
                bio: c.bio
            },
            status: c.status,
            created_at: c.created_at
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching connections:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get connection status with specific user
router.get('/status/:userId', auth, async (req, res) => {
    const otherUserId = parseInt(req.params.userId);
    const currentUserId = req.user.id;

    try {
        const db = getDb();

        const connection = db.prepare(`
      SELECT * FROM connections 
      WHERE (requester_id = ? AND recipient_id = ?) OR (requester_id = ? AND recipient_id = ?)
    `).get(currentUserId, otherUserId, otherUserId, currentUserId);

        if (!connection) {
            return res.json({ status: 'none', connectionId: null });
        }

        res.json({
            status: connection.status,
            connectionId: connection.id,
            isRequester: connection.requester_id === currentUserId
        });
    } catch (error) {
        console.error('Error checking connection status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
