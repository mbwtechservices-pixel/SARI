'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api/axios';
import toast from 'react-hot-toast';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Password reset link sent to your email!');
      setSent(true);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 w-full max-w-md"
      >
        <h1 className="text-4xl font-bold text-center mb-2 gradient-text">SARI</h1>
        <p className="text-center text-gray-400 mb-8">Reset your password</p>

        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-green-400">Check your email for the reset link!</p>
            <Link
              href="/auth/login"
              className="inline-block text-purple-400 hover:text-purple-300"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="your@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="text-center mt-6 text-gray-400">
          <Link href="/auth/login" className="text-purple-400 hover:text-purple-300">
            Back to Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

