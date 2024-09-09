require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('../config/database');
const userRoutes = require('../src/routes/auth');
const documentRoutes = require('./routes/documents');
const Document = require('./model/Document');
const jwt = require('jsonwebtoken');
const Redis = require('ioredis');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
};

// Initialize Redis client
const redis = new Redis(redisConfig);

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

redis.on('connect', () => {
  console.log('Successfully connected to Redis');
});

connectDB();

app.use(cors());
app.use(express.json());

app.use('/users', userRoutes);
app.use('/documents', documentRoutes);

const activeUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Authentication error'));
    socket.decoded = decoded;
    next();
  });
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join-document', async (documentId) => {
    socket.join(documentId);
    const document = await Document.findById(documentId).populate('owner', 'username');
    if (document) {
      socket.emit('document-update', document);

      if (!activeUsers.has(documentId)) {
        activeUsers.set(documentId, new Set());
      }
      activeUsers.get(documentId).add(socket.decoded.username);

      const collaborators = Array.from(activeUsers.get(documentId)).map(username => ({
        username,
        isOnline: true,
      }));
      io.to(documentId).emit('collaborators-update', collaborators);
    }
  });

  socket.on('leave-document', (documentId) => {
    socket.leave(documentId);
    if (activeUsers.has(documentId)) {
      activeUsers.get(documentId).delete(socket.decoded.username);
      if (activeUsers.get(documentId).size === 0) {
        activeUsers.delete(documentId);
      } else {
        const collaborators = Array.from(activeUsers.get(documentId)).map(username => ({
          username,
          isOnline: true,
        }));
        io.to(documentId).emit('collaborators-update', collaborators);
      }
    }
  });

  socket.on('update-document', async ({ documentId, content }) => {
    try {
      // Store the content in Redis cache
      await redis.set(`doc:${documentId}`, JSON.stringify({ content, timestamp: Date.now() }));

      // Emit the update to all clients immediately
      io.to(documentId).emit('document-update', { _id: documentId, content });

      // Schedule the MongoDB update after 5 seconds
      setTimeout(async () => {
        try {
          // Get the latest version from Redis
          const cachedDoc = await redis.get(`doc:${documentId}`);
          if (cachedDoc) {
            const { content: latestContent } = JSON.parse(cachedDoc);
            
            // Update MongoDB
            const document = await Document.findByIdAndUpdate(documentId, { content: latestContent }, { new: true })
              .populate('owner', 'username');
            
            // Emit the update again (in case there were any changes during the 5-second window)
            io.to(documentId).emit('document-update', document);
          }
        } catch (error) {
          console.error('Error updating document in MongoDB:', error);
        }
      }, 10000);
    } catch (error) {
      console.error('Error updating document:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    for (const [documentId, users] of activeUsers.entries()) {
      if (users.has(socket.decoded.username)) {
        users.delete(socket.decoded.username);
        if (users.size === 0) {
          activeUsers.delete(documentId);
        } else {
          const collaborators = Array.from(users).map(username => ({
            username,
            isOnline: true,
          }));
          io.to(documentId).emit('collaborators-update', collaborators);
        }
      }
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
