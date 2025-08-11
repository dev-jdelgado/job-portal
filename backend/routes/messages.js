const express = require('express');
const router = express.Router();
const db = require('../db'); // your DB connection

// Save message
router.post('/', async (req, res) => {
    const { senderId, receiverId, content } = req.body;
    try {
        await db.query(
        'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
        [senderId, receiverId, content]
        );
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error saving message' });
    }
});


// Get unread messages count for a user
router.get('/unread-count/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await db.query(
        `SELECT COUNT(*) AS unreadCount FROM messages 
        WHERE receiver_id = ? AND is_read = 0`,
        [userId]
        );
        res.json({ unreadCount: rows[0].unreadCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching unread messages count' });
    }
});

// Mark messages as read between user and sender (called when chat opened)
router.post('/mark-read', async (req, res) => {
    const { userId, senderId } = req.body;
    if (!userId || !senderId) {
        return res.status(400).json({ error: 'userId and senderId are required' });
    }
    try {
        await db.query(
        `UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND sender_id = ? AND is_read = 0`,
        [userId, senderId]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error marking messages as read' });
    }
});

// Get messages with a specific user (for admin view)
router.get('/:userId/:adminId', async (req, res) => {
    const { userId, adminId } = req.params;
    try {
        const [rows] = await db.query(
        'SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY timestamp',
        [userId, adminId, adminId, userId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving messages' });
    }
});

// Get all seekers who had any message with admin
router.get('/seekers/:adminId', async (req, res) => {
    const { adminId } = req.params;
    try {
        const [rows] = await db.query(
            `SELECT DISTINCT u.id, u.name
             FROM users u
             INNER JOIN messages m ON (
                (m.sender_id = u.id AND m.receiver_id = ?)
                OR
                (m.receiver_id = u.id AND m.sender_id = ?)
             )
             WHERE u.role = 'seeker'`,
            [adminId, adminId]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching seekers' });
    }
});

router.get('/users/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await db.query(`SELECT id, name FROM users WHERE id = ?`, [userId]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching user' });
    }
});

module.exports = router;
