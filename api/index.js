const express = require('express');
const http = require('http');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const jwt = require('jsonwebtoken');
const { init } = require('./db/db');
const { validateEnv } = require('./validateEnv');

// Validate environment variables before starting
try {
  validateEnv();
} catch (error) {
  console.error('Environment validation failed:', error.message);
  process.exit(1);
}

init();

const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const eventsRouter = require('./routes/events');
const connectionsRouter = require('./routes/connections');
const chatRoomsRouter = require('./routes/chatRooms');

const compression = require('compression');
const winston = require('winston');

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'twohearts-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const { init: initSocket } = require('./socket');
const io = initSocket(server);

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for now to avoid breaking inline scripts if any
}));
app.use(compression()); // Compress responses
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/events', eventsRouter);
app.use('/api/connections', connectionsRouter);
app.use('/api/chat-rooms', chatRoomsRouter);

const setupSwagger = require('./swagger');
setupSwagger(app);

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next(new Error('Server configuration error'));
    }

    const decoded = jwt.verify(token, jwtSecret);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    console.error('Socket authentication error:', err);
    next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.IO connection logic
const { getDb } = require('./db/db');

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  const userId = socket.userId; // From authentication middleware

  // Validate userId
  if (!userId) {
    console.error('No userId found for socket:', socket.id);
    socket.disconnect();
    return;
  }

  // --- User Presence ---
  socket.broadcast.emit('userOnline', { userId });
  console.log(`User ${userId} is online.`);

  socket.on('disconnect', () => {
    try {
      const db = getDb();
      db.prepare('UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = ?').run(userId);
      socket.broadcast.emit('userOffline', { userId });
      console.log(`User ${userId} is offline.`);
    } catch (error) {
      console.error('Error updating last_seen:', error);
    }
    console.log('A user disconnected:', socket.id);
  });

  socket.on('joinChat', (chatRoomId) => {
    socket.join(`chat_${chatRoomId}`);
    console.log(`User ${userId} joined chat room ${chatRoomId}`);
  });

  // --- Typing Indicators ---
  socket.on('typing', ({ chatRoomId, user }) => {
    socket.to(`chat_${chatRoomId}`).emit('userTyping', { user });
  });

  socket.on('stopTyping', ({ chatRoomId }) => {
    socket.to(`chat_${chatRoomId}`).emit('userStoppedTyping');
  });

  // --- Read Receipts ---
  socket.on('messageRead', ({ messageId, chatRoomId, readerId }) => {
    try {
      const db = getDb();
      db.prepare(
        'INSERT OR IGNORE INTO message_read_receipts (message_id, user_id) VALUES (?, ?)'
      ).run(messageId, readerId);

      // Notify the chat that a message has been read
      io.to(`chat_${chatRoomId}`).emit('messageReadReceipt', {
        messageId,
        userId: readerId,
        readAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving read receipt:', error);
    }
  });
});

// Serve static files
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Serve the app
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Socket.IO enabled`);
});

module.exports = { app, server, io };
