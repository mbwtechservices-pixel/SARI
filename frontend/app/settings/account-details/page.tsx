'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import TopNav from '@/components/TopNav';
import { useAuth } from '@/lib/context/AuthContext';
import { FiArrowLeft, FiMail, FiCalendar } from 'react-icons/fi';
import Image from 'next/image';

export default function AccountDetailsPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <TopNav />
      <div className="min-h-screen pb-20 pt-16">
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <FiArrowLeft size={24} />
            </button>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold gradient-text"
            >
              Account Details
            </motion.h1>
          </div>

          <div className="glass p-6 space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                {user?.profilePicture ? (
                  <Image
                    src={user.profilePicture}
                    alt={user.name}
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold text-3xl">
                    {user?.name[0]?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold">{user?.name}</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400 flex items-center space-x-2">
                  <FiMail size={16} />
                  <span>Email</span>
                </label>
                <p className="text-lg">{user?.email || 'Not available'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400 flex items-center space-x-2">
                  <FiCalendar size={16} />
                  <span>Account Type</span>
                </label>
                <p className="text-lg capitalize">{user?.accountMode || 'public'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Account Status</label>
                <p className="text-lg">
                  {user?.isEmailVerified ? (
                    <span className="text-green-400">Verified</span>
                  ) : (
                    <span className="text-yellow-400">Unverified</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}

