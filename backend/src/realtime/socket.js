const { Server } = require('socket.io');
const { verifyToken, COOKIE_NAME } = require('../services/auth.service');

let io = null;

function parseCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const match = cookieHeader.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

// Same admin-session cookie the REST API uses — no separate socket auth
// scheme to maintain. Sockets that fail verification never reach 'connection'.
function init(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: true, credentials: true }
  });

  io.use((socket, next) => {
    try {
      const token = parseCookie(socket.handshake.headers.cookie, COOKIE_NAME);
      if (!token) return next(new Error('Unauthorized'));
      socket.admin = verifyToken(token);
      next();
    } catch (error) {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Admin socket connected: ${socket.admin?.email || 'unknown'}`);
    socket.on('disconnect', () => {
      console.log(`🔌 Admin socket disconnected: ${socket.admin?.email || 'unknown'}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.IO not initialized — call init(httpServer) first.');
  return io;
}

module.exports = { init, getIO };
