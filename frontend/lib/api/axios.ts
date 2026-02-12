import axios from 'axios';

// In development, talk directly to the local backend.
// In production (Vercel), NEXT_PUBLIC_API_BASE_URL should be set to your backend base URL.
// Example:
//   NEXT_PUBLIC_API_BASE_URL = "https://your-backend.vercel.app/api"
const api = axios.create({
  baseURL:  '/' ,
   //baseURL: 'http://localhost:7993/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
