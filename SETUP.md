# SARI Setup Guide

## Quick Start

1. **Install all dependencies:**
```bash
npm run install:all
```

2. **Setup Backend Environment Variables:**
Create `.env` file in `/backend` directory:
```env
MONGODB_URI=mongodb://localhost:27017/sari
# Or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/sari

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

FRONTEND_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
```

3. **Setup Frontend Environment Variables:**
Create `.env.local` file in `/frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

4. **Run the application:**
```bash
npm run dev
```

This will start:
- Frontend on http://localhost:3000
- Backend on http://localhost:5000

## Gmail SMTP Setup

1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Generate an App Password:
   - Go to Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in `EMAIL_PASS`

## Cloudinary Setup

1. Sign up at https://cloudinary.com
2. Get your Cloud Name, API Key, and API Secret from the dashboard
3. Add them to your backend `.env` file

## MongoDB Setup

### Option 1: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use: `mongodb://localhost:27017/sari`

### Option 2: MongoDB Atlas (Recommended)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Replace `<password>` with your password
5. Use the connection string in `MONGODB_URI`

## Vercel Deployment

### Backend Deployment
1. Connect your GitHub repo to Vercel
2. Set root directory to `/backend`
3. Add all environment variables
4. Deploy

### Frontend Deployment
1. Connect your GitHub repo to Vercel
2. Set root directory to `/frontend`
3. Add `NEXT_PUBLIC_API_URL` pointing to your backend URL
4. Deploy

## Troubleshooting

### Socket.io Connection Issues
- Make sure CORS is properly configured
- Check that both frontend and backend URLs are correct
- Verify JWT token is being sent correctly

### Image Upload Issues
- Verify Cloudinary credentials
- Check file size limits (10MB max)
- Ensure proper file formats (jpg, png, gif)

### Email Not Sending
- Verify Gmail App Password is correct
- Check that 2-Step Verification is enabled
- Ensure `EMAIL_USER` is your full Gmail address

