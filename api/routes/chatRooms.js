const express = require('express');
const router = express.Router();
const { getDb } = require('../db/db');
const auth = require('../middleware/auth');
const { getIO } = require('../socket');
const cache = require('../lib/cache');
const { messageLimiter } = require('../middleware/rateLimiter');
const { scheduleDeletion } = require('../services/ephemeral');
const { detectAndLogContact } = require('../services/contactDetection');

// Get all chat rooms for current user (with pagination)
router.get('/', auth, async (req, res) => {
    try {
        const db = getDb();
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        // Try cache first
        const cacheKey = `chat_rooms:${userId}:${page}:${limit}`;
        const cached = cache.get(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const chatRooms = db.prepare(`
      SELECT 
        cr.id,
        cr.created_at,
        u.id as other_user_id,
        u.name as other_user_name,
        u.email as other_user_email,
        (SELECT content FROM messages WHERE chat_room_id = cr.id ORDER BY created_at DESC LIMIT 1) as last_message_content,
        (SELECT created_at FROM messages WHERE chat_room_id = cr.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
        (SELECT COUNT(*) FROM messages m 
         WHERE m.chat_room_id = cr.id 
         AND m.user_id != ? 
         AND m.id NOT IN (SELECT message_id FROM message_read_receipts WHERE user_id = ?)) as unread_count
      FROM chat_rooms cr
      JOIN users u ON (CASE 
        WHEN cr.user1_id = ? THEN cr.user2_id 
        ELSE cr.user1_id 
      END) = u.id
      WHERE cr.user1_id = ? OR cr.user2_id = ?
      ORDER BY last_message_time DESC NULLS LAST
      LIMIT ? OFFSET ?
    `).all(userId, userId, userId, userId, userId, limit, offset);

        // Get total count
        const totalCount = db.prepare(`
      SELECT COUNT(*) as count FROM chat_rooms 
      WHERE user1_id = ? OR user2_id = ?
    `).get(userId, userId).count;

        const formatted = chatRooms.map(room => ({
            id: room.id,
            otherUser: {
                id: room.other_user_id,
                name: room.other_user_name || room.other_user_email,
                email: room.other_user_email
            },
            lastMessage: room.last_message_content ? {
                content: room.last_message_content,
                created_at: room.last_message_time
            } : null,
            unreadCount: room.unread_count || 0,
            created_at: room.created_at
        }));

        const result = {
            chatRooms: formatted,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        };

        // Cache for 1 minute
        cache.set(cacheKey, result, 60);

        res.json(result);
    } catch (error) {
        console.error('Error fetching chat rooms:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get messages for specific chat room (with pagination)
router.get('/:id/messages', auth, async (req, res) => {
    const chatRoomId = req.params.id;
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    try {
        const db = getDb();

        // Verify user has access to this chat room
        const chatRoom = db.prepare(
            'SELECT * FROM chat_rooms WHERE id = ? AND (user1_id = ? OR user2_id = ?)'
        ).get(chatRoomId, userId, userId);

        if (!chatRoom) {
            return res.status(404).json({ message: 'Chat room not found' });
        }

        // Get messages with read receipts
        const messages = db.prepare(`
      SELECT 
        m.id,
        m.user_id,
        m.content,
        m.created_at,
        m.deleted_at,
        GROUP_CONCAT(mrr.user_id) as read_by_users
      FROM messages m
      LEFT JOIN message_read_receipts mrr ON m.id = mrr.message_id
      WHERE m.chat_room_id = ? 
      AND m.deleted_at IS NULL
      AND m.deleted_for_recipient_at IS NULL
      GROUP BY m.id
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `).all(chatRoomId, limit, offset);

        const formatted = messages.reverse().map(msg => ({
            id: msg.id,
            user_id: msg.user_id,
            content: msg.content,
            created_at: msg.created_at,
            isDeleted: !!msg.deleted_at,
            read_receipts: msg.read_by_users ? msg.read_by_users.split(',').map(id => ({ user_id: parseInt(id) })) : []
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Send message to chat room (with rate limiting)
router.post('/:id/messages', auth, messageLimiter, async (req, res) => {
    const chatRoomId = req.params.id;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim() === '') {
        return res.status(400).json({ message: 'Message content is required' });
    }

    try {
        const db = getDb();

        // Verify user has access to this chat room
        const chatRoom = db.prepare(
            'SELECT * FROM chat_rooms WHERE id = ? AND (user1_id = ? OR user2_id = ?)'
        ).get(chatRoomId, userId, userId);

        if (!chatRoom) {
            return res.status(404).json({ message: 'Chat room not found' });
        }

        // Insert message
        const stmt = db.prepare(
            'INSERT INTO messages (chat_room_id, user_id, content) VALUES (?, ?, ?)'
        );
        const result = stmt.run(chatRoomId, userId, content);

        const message = {
            id: result.lastInsertRowid,
            chat_room_id: chatRoomId,
            user_id: userId,
            content: content,
            created_at: new Date().toISOString(),
            read_receipts: []
        };

        // Clear cache
        cache.delete(`chat_rooms:${userId}:1:20`);

        // Emit to chat room via Socket.IO
        try {
            const io = getIO();
            io.to(`chat_${chatRoomId}`).emit('newMessage', message);

            // Try to detect contact info sharing
            try {
                const incident = await detectAndLogContact(userId, message.id, content);
                if (incident) {
                    try {
                        scheduleDeletion(message.id, chatRoomId);
                    } catch (scheduleErr) {
                        console.error('Error scheduling deletion:', scheduleErr);
                    }
                }
            } catch (detectErr) {
                console.error('Error detecting contact:', detectErr);
                // Don't fail the message send if detection fails
            }
        } catch (socketError) {
            console.error('Socket.IO error:', socketError);
            // Don't fail the request if socket fails
        }

        res.status(201).json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Mark message as read
router.post('/:chatId/messages/:messageId/read', auth, async (req, res) => {
    const { chatId, messageId } = req.params;
    const userId = req.user.id;

    try {
        const db = getDb();

        // Verify user has access to this chat room
        const chatRoom = db.prepare(
            'SELECT * FROM chat_rooms WHERE id = ? AND (user1_id = ? OR user2_id = ?)'
        ).get(chatId, userId, userId);

        if (!chatRoom) {
            return res.status(404).json({ message: 'Chat room not found' });
        }

        // Insert read receipt
        db.prepare(
            'INSERT OR IGNORE INTO message_read_receipts (message_id, user_id) VALUES (?, ?)'
        ).run(messageId, userId);

        // Emit read receipt via Socket.IO
        try {
            const io = getIO();
            io.to(`chat_${chatId}`).emit('messageReadReceipt', {
                messageId: parseInt(messageId),
                userId: userId,
                readAt: new Date().toISOString()
            });
        } catch (socketError) {
            console.error('Socket.IO error:', socketError);
        }

        res.json({ message: 'Message marked as read' });
    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
