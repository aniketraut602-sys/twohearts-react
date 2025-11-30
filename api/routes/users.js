const express = require('express');
const { getDb } = require('../db/db');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/me', auth, (req, res) => {
  try {
    const db = getDb();
    const stmt = db.prepare('SELECT id, email, name, bio, interests, seeking, age, location, created_at FROM users WHERE id = ?');
    const user = stmt.get(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all users for browsing (excluding current user)
router.get('/browse', auth, (req, res) => {
  try {
    const db = getDb();
    const stmt = db.prepare('SELECT id, email, name, bio, interests, seeking, age, location, created_at FROM users WHERE id != ?');
    const users = stmt.all(req.user.id);

    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get specific user profile
router.get('/profile/:id', auth, (req, res) => {
  try {
    const db = getDb();
    const userId = req.params.id;
    const stmt = db.prepare('SELECT id, email, name, bio, interests, seeking, age, location, created_at FROM users WHERE id = ?');
    const user = stmt.get(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update own profile
router.put('/profile', auth, (req, res) => {
  try {
    const db = getDb();
    const { name, bio, interests, seeking, age, location } = req.body;
    const userId = req.user.id;

    const stmt = db.prepare(`
      UPDATE users 
      SET name = ?, bio = ?, interests = ?, seeking = ?, age = ?, location = ?
      WHERE id = ?
    `);

    stmt.run(name, bio, interests, seeking, age, location, userId);

    // Get updated user
    const updatedUser = db.prepare('SELECT id, email, name, bio, interests, seeking, age, location, created_at FROM users WHERE id = ?').get(userId);

    res.json(updatedUser);
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;