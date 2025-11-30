const express = require('express');
const { getDb } = require('../db/db');

const router = express.Router();

router.post('/', (req, res) => {
  try {
    const { event_type, payload } = req.body;

    if (!event_type) {
      return res.status(400).json({ message: 'Event type is required' });
    }

    const db = getDb();
    const stmt = db.prepare('INSERT INTO events (event_type, payload) VALUES (?, ?)');
    stmt.run(event_type, JSON.stringify(payload));

    res.status(200).json({ message: 'Event received' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;