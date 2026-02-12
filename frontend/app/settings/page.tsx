'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import TopNav from '@/components/TopNav';
import { 
  FiUser, 
  FiSettings, 
  FiFileText, 
  FiLock, 
  FiShield, 
  FiInfo,
  FiChevronRight 
} from 'react-icons/fi';

const settingsCategories = [
  {
    id: 'profile',
    title: 'Profile',
    description: 'Edit your profile information',
    icon: FiUser,
    href: '/settings/profile',
  },
  {
    id: 'general',
    title: 'General',
    description: 'Theme, notifications, and preferences',
    icon: FiSettings,
    href: '/settings/general',
  },
  {
    id: 'posts',
    title: 'Posts',
    description: 'View and manage your posts',
    icon: FiFileText,
    href: '/settings/posts',
  },
  {
    id: 'change-password',
    title: 'Change Password',
    description: 'Update your account password',
    icon: FiLock,
    href: '/settings/change-password',
  },
  {
    id: 'policies',
    title: 'Policies',
    description: 'Terms of Service and Privacy Policy',
    icon: FiShield,
    href: '/settings/policies',
  },
  {
    id: 'account-details',
    title: 'Account Details',
    description: 'View your account information',
    icon: FiInfo,
    href: '/settings/account-details',
  },
];

export default function SettingsPage() {
  const router = useRouter();

  return (
    <ProtectedRoute>
      <TopNav />
      <div className="min-h-screen pb-20 pt-16">
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold gradient-text mb-6"
          >
            Settings
          </motion.h1>

          <div className="space-y-2">
            {settingsCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => router.push(category.href)}
                  className="glass p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors rounded-lg"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                      <Icon size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{category.title}</h3>
                      <p className="text-sm text-gray-400">{category.description}</p>
                    </div>
                  </div>
                  <FiChevronRight size={20} className="text-gray-400" />
                </motion.div>
              );
            })}
          </div>
        </div>
        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
