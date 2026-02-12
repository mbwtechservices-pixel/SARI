'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { FiLogOut, FiUser, FiX } from 'react-icons/fi';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopNav() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    await logout();
    router.push('/auth/login');
    setShowLogoutConfirm(false);
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const handleProfileClick = () => {
    if (user?.id) {
      router.push(`/profile/${user.id}`);
    }
  };

  if (!user) return null;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div
            onClick={handleProfileClick}
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
              {user.profilePicture ? (
                <Image
                  src={user.profilePicture}
                  alt={user.name}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <span className="text-white font-semibold">
                  {user.name[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="hidden sm:block">
              <p className="font-semibold text-sm">{user.name}</p>
            </div>
          </div>

          <button
            onClick={handleLogoutClick}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            title="Logout"
          >
            <FiLogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleLogoutCancel}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -50, x: '-50%' }}
              animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
              exit={{ opacity: 0, scale: 0.9, y: -50, x: '-50%' }}
              className="fixed top-1/2 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-md"
              style={{ maxWidth: 'calc(100% - 2rem)' }}
            >
              <div className="glass p-4 sm:p-6 rounded-lg space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg sm:text-xl font-bold">Confirm Logout</h3>
                  <button
                    onClick={handleLogoutCancel}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                  >
                    <FiX size={20} />
                  </button>
                </div>
                <p className="text-sm sm:text-base text-gray-300">
                  Are you sure you want to logout? You'll need to login again to access your account.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:space-x-3 sm:gap-0">
                  <button
                    onClick={handleLogoutCancel}
                    className="flex-1 py-3 px-4 bg-gray-600 rounded-lg font-semibold hover:bg-gray-700 transition-all text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogoutConfirm}
                    className="flex-1 py-3 px-4 bg-red-600 rounded-lg font-semibold hover:bg-red-700 transition-all text-sm sm:text-base"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

