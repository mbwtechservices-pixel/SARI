import axios from 'axios';

const api = axios.create({
  baseURL:'/api',
  // baseURL:'http://localhost:7993',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

