const jwt = require('jsonwebtoken');
const Document = require('../model/Document');

const activeUsers = new Map();

const socketAuth = (socket, next) => {
  const token = socket.handshake.auth.token;
  jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
    if (err) return next(new Error('Authentication error'));
    socket.decoded = decoded;
    next();
  });
};

const handleJoinDocument = async (io, socket, documentId) => {
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
};

const handleLeaveDocument = (io, socket, documentId) => {
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
};

const handleUpdateDocument = async (io, documentId, content) => {
  try {
    const document = await Document.findByIdAndUpdate(documentId, { content }, { new: true })
      .populate('owner', 'username');
    io.to(documentId).emit('document-update', document);
  } catch (error) {
    console.error('Error updating document:', error);
  }
};

const handleDisconnect = (io, socket) => {
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
};

module.exports = {
  socketAuth,
  handleJoinDocument,
  handleLeaveDocument,
  handleUpdateDocument,
  handleDisconnect
};

