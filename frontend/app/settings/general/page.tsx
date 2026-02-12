'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import TopNav from '@/components/TopNav';
import { FiArrowLeft } from 'react-icons/fi';

export default function GeneralSettingsPage() {
  const router = useRouter();

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
              General Settings
            </motion.h1>
          </div>

          <div className="glass p-6">
            <p className="text-gray-400">
              General settings and preferences will be available here.
            </p>
          </div>
        </div>
        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}

