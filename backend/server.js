// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import cookieParser from 'cookie-parser';
// import dotenv from 'dotenv';
// import { createServer } from 'http';
// import { Server } from 'socket.io';
// import authRoutes from './routes/auth.js';
// import userRoutes from './routes/user.js';
// import friendRoutes from './routes/friends.js';
// import chatRoutes from './routes/chat.js';
// import postRoutes from './routes/posts.js';
// import { initializeSocket } from './socket.js';

// dotenv.config();

// const app = express();
// const httpServer = createServer(app);
// const io = new Server(httpServer, {
//   cors: {
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//     credentials: true,
//   },
// });

// // Middleware
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//   credentials: true,
// }));
// app.use(express.json());
// app.use(cookieParser());

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/user', userRoutes);
// app.use('/api/friends', friendRoutes);
// app.use('/api/chat', chatRoutes);
// app.use('/api/posts', postRoutes);

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'ok', message: 'SARI API is running' });
// });

// // Initialize Socket.io
// initializeSocket(io);

// // Connect to MongoDB
// mongoose.connect('mongodb+srv://sari:sari@sari.kba6cx6.mongodb.net/?appName=sari')
//   .then(() => console.log('✅ MongoDB connected'))
//   .catch((err) => console.error('❌ MongoDB connection error:', err));

// const PORT = 7993;

// // For local development
// if (process.env.NODE_ENV !== 'production') {
//   httpServer.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`);
//   });
// }

// // Export for Vercel serverless
// export default httpServer;

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import serverless from 'serverless-http';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// IMPORTANT: Remove /api prefix here
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/friends', friendRoutes);
app.use('/chat', chatRoutes);
app.use('/posts', postRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

mongoose.connect(process.env.MONGO_URI);

export const handler = serverless(app);
export default handler;
