# SARI - Futuristic Social Chat App

A full-stack MERN + Next.js social chatting web application with real-time messaging, friend system, posts feed, and futuristic UI.

## 🚀 Features

- **Authentication**: Signup with OTP verification, Login, Forgot Password
- **User Profiles**: Customizable profiles with theme colors
- **Friend System**: Search users, send/accept friend requests
- **Real-time Chat**: Socket.io powered messaging with typing indicators and seen status
- **Posts Feed**: Share posts with images, like and comment
- **Futuristic UI**: Glassmorphism, neon effects, smooth animations
- **Mobile Responsive**: Optimized for all devices

## 🛠️ Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Socket.io Client
- React Hot Toast

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Socket.io
- Nodemailer (Gmail SMTP)
- Cloudinary (Media Storage)

## 📦 Installation

1. **Clone the repository**
```bash
cd SARI
```

2. **Install dependencies**
```bash
npm run install:all
```

3. **Setup environment variables**

Backend (`.env` in `/backend`):
```env
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
FRONTEND_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
```

Frontend (`.env.local` in `/frontend`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

4. **Run the application**
```bash
npm run dev
```

This will start both frontend (port 3000) and backend (port 5000) concurrently.

## 🎨 UI Features

- **Glassmorphism**: Frosted glass effect on cards
- **Neon Glows**: Gradient borders and shadows
- **Smooth Animations**: Framer Motion powered transitions
- **Dark Mode**: Default dark theme
- **Mobile Navigation**: Bottom navigation bar for mobile devices

## 📱 Pages

- `/auth/login` - Login page
- `/auth/signup` - Signup with OTP
- `/auth/forgot-password` - Password reset
- `/home` - Posts feed
- `/friends` - Friends management
- `/chat/[friendId]` - Real-time chat
- `/chats` - All chats list
- `/upload` - Create new post
- `/settings` - User settings and profile

## 🚢 Deployment

### Vercel Deployment

1. **Backend Deployment**
   - Connect your backend folder to Vercel
   - Add all environment variables
   - Deploy as serverless functions

2. **Frontend Deployment**
   - Connect your frontend folder to Vercel
   - Set `NEXT_PUBLIC_API_URL` to your backend URL
   - Deploy

## 📝 Notes

- Make sure MongoDB is running or use MongoDB Atlas
- Configure Gmail App Password for email functionality
- Set up Cloudinary account for media storage
- Update CORS settings for production

## 🔐 Security

- JWT tokens stored in HTTP-only cookies
- Password hashing with bcrypt
- Protected routes with authentication middleware
- Secure file uploads to Cloudinary

## 📄 License

ISC

