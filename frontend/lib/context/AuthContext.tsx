'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api/axios';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
  bio: string;
  accountMode: 'public' | 'private';
  themeColors: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<{ userId: string }>;
  verifyOTP: (userId: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/user/me');
      const userData = response.data;
      // Map _id to id for consistency
      if (userData._id && !userData.id) {
        userData.id = userData._id;
      }
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const userData = response.data.user;
      // Map _id to id for consistency
      if (userData._id && !userData.id) {
        userData.id = userData._id;
      }
      setUser(userData);
      toast.success('Login successful!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      toast.success('OTP sent to your email!');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Signup failed');
      throw error;
    }
  };

  const verifyOTP = async (userId: string, otp: string) => {
    try {
      const response = await api.post('/auth/verify-otp', { userId, otp });
      const userData = response.data.user;
      // Map _id to id for consistency
      if (userData._id && !userData.id) {
        userData.id = userData._id;
      }
      setUser(userData);
      toast.success('Account created successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'OTP verification failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedData = { ...user, ...userData };
      // Ensure id is set if _id exists
      if ((updatedData as any)._id && !updatedData.id) {
        updatedData.id = (updatedData as any)._id;
      }
      setUser(updatedData);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, verifyOTP, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

