import { Server } from 'socket.io';

let io;

export function initSockets(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('[Socket.IO] Client connected:', socket.id);

    // Patient joins a specific doctor's queue room
    socket.on('queue:join', (doctorId) => {
      socket.join(`queue:${doctorId}`);
      console.log(`[Socket.IO] Client ${socket.id} joined room queue:${doctorId}`);
    });

    // Patient leaves a room
    socket.on('queue:leave', (doctorId) => {
      socket.leave(`queue:${doctorId}`);
      console.log(`[Socket.IO] Client ${socket.id} left room queue:${doctorId}`);
    });

    socket.on('disconnect', () => {
      console.log('[Socket.IO] Client disconnected:', socket.id);
    });
  });
}

export function emitQueueUpdate(doctorId, type, data) {
  if (io) {
    io.to(`queue:${doctorId}`).emit('queue:update', { type, data });
  }
}
