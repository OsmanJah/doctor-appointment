import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: true,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Socket middleware for authentication
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.userId}, Role: ${socket.userRole})`);

    // Join user to their personal room for notifications
    socket.join(socket.userId);
    
    // Handle joining specific chat rooms
    socket.on('joinChat', ({ chatId }) => {
      if (chatId) {
        socket.join(`chat_${chatId}`);
        console.log(`Socket ${socket.id} joined chat room: chat_${chatId}`);
      }
    });

    // Handle leaving chat rooms
    socket.on('leaveChat', ({ chatId }) => {
      if (chatId) {
        socket.leave(`chat_${chatId}`);
        console.log(`Socket ${socket.id} left chat room: chat_${chatId}`);
      }
    });

    // Handle typing indicators
    socket.on('typing', ({ chatId, isTyping }) => {
      socket.to(`chat_${chatId}`).emit('userTyping', {
        userId: socket.userId,
        isTyping,
        timestamp: new Date()
      });
    });

    // Handle online status
    socket.on('updateOnlineStatus', ({ isOnline }) => {
      socket.broadcast.emit('userOnlineStatus', {
        userId: socket.userId,
        isOnline,
        timestamp: new Date()
      });
    });

    // Handle message read receipts
    socket.on('markMessageAsRead', ({ chatId, messageId }) => {
      socket.to(`chat_${chatId}`).emit('messageReadReceipt', {
        messageId,
        readBy: socket.userId,
        readAt: new Date()
      });
    });

    // Legacy support for doctor rooms (for appointment notifications)
    socket.on('join', ({ doctorId }) => {
      if (doctorId) {
        socket.join(doctorId.toString());
        console.log(`Socket ${socket.id} joined doctor room ${doctorId}`);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id} (User: ${socket.userId})`);
      
      // Broadcast offline status
      socket.broadcast.emit('userOnlineStatus', {
        userId: socket.userId,
        isOnline: false,
        timestamp: new Date()
      });
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

// Helper function to emit to specific chat room
export const emitToChatRoom = (chatId, event, data) => {
  if (io) {
    io.to(`chat_${chatId}`).emit(event, data);
  }
};

// Helper function to emit to specific user
export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(userId.toString()).emit(event, data);
  }
};

// Helper function to get online users in a chat
export const getOnlineUsersInChat = async (chatId) => {
  if (!io) return [];
  
  try {
    const sockets = await io.in(`chat_${chatId}`).fetchSockets();
    return sockets.map(socket => ({
      userId: socket.userId,
      userRole: socket.userRole,
      socketId: socket.id
    }));
  } catch (error) {
    console.error('Error fetching online users:', error);
    return [];
  }
};
