'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import TopNav from '@/components/TopNav';
import { FiArrowLeft } from 'react-icons/fi';

export default function PoliciesPage() {
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
              Policies
            </motion.h1>
          </div>

          <div className="glass p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">Terms of Service</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                By using SARI, you agree to our Terms of Service. Please read these terms carefully before using our platform.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Privacy Policy</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Community Guidelines</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                We expect all users to follow our community guidelines to ensure a safe and respectful environment for everyone.
              </p>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}

