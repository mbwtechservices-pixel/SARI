import jwt from 'jsonwebtoken';

export const initializeSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = 'wckdnondqocaihconqoichsoicnsoihosinoxihsoxin';
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    
    // Join user's personal room
    socket.join(`user_${socket.userId}`);

    // Join chat room
    socket.on('join_chat', (chatId) => {
      socket.join(`chat_${chatId}`);
    });

    // Leave chat room
    socket.on('leave_chat', (chatId) => {
      socket.leave(`chat_${chatId}`);
    });

    // Send message
    socket.on('send_message', (data) => {
      io.to(`chat_${data.chatId}`).emit('receive_message', {
        ...data,
        timestamp: new Date(),
      });
    });

    // Typing indicator
    socket.on('typing', (data) => {
      socket.to(`chat_${data.chatId}`).emit('user_typing', {
        userId: socket.userId,
        chatId: data.chatId,
        isTyping: data.isTyping,
      });
    });

    // Mark as seen
    socket.on('mark_seen', (data) => {
      io.to(`chat_${data.chatId}`).emit('message_seen', {
        messageId: data.messageId,
        chatId: data.chatId,
        seenBy: socket.userId,
      });
    });

    // Online status
    socket.on('user_online', () => {
      socket.broadcast.emit('user_status', {
        userId: socket.userId,
        status: 'online',
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      socket.broadcast.emit('user_status', {
        userId: socket.userId,
        status: 'offline',
      });
    });
  });
};

