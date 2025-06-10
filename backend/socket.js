import { Server } from 'socket.io';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: true,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Expecting doctor to join personal room
    socket.on('join', ({ doctorId }) => {
      if (doctorId) {
        socket.join(doctorId.toString());
        console.log(`Socket ${socket.id} joined doctor room ${doctorId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
