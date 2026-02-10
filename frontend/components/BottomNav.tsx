'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FiHome, 
  FiUsers, 
  FiPlusCircle, 
  FiSettings,
  FiMessageCircle 
} from 'react-icons/fi';
import api from '@/lib/api/axios';
import { useAuth } from '@/lib/context/AuthContext';

const navItems = [
  { href: '/home', icon: FiHome, label: 'Home' },
  { href: '/friends', icon: FiUsers, label: 'Friends' },
  { href: '/upload', icon: FiPlusCircle, label: 'Upload' },
  { href: '/chats', icon: FiMessageCircle, label: 'Chats' },
  { href: '/settings', icon: FiSettings, label: 'Settings' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [hasChatNotification, setHasChatNotification] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const [chatsRes, requestsRes] = await Promise.all([
          api.get('/chat/list'),
          api.get('/friends/requests'),
        ]);

        const chats = chatsRes.data || [];
        const hasUnread = chats.some((chat: any) => chat.hasUnreadForCurrentUser);

        const requests = requestsRes.data || { received: [], sent: [] };
        const hasPendingRequests =
          Array.isArray(requests.received) && requests.received.length > 0;

        setHasChatNotification(hasUnread || hasPendingRequests);
      } catch {
        // Ignore notification errors in UI
      }
    };

    // Initial fetch
    fetchNotifications();

    // Poll periodically so badge updates after reading/replying
    const intervalId = setInterval(fetchNotifications, 5000);

    return () => clearInterval(intervalId);
  }, [user]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="glass-dark border-t border-white/10">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            const showBadge = item.href === '/chats' && hasChatNotification;

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`relative flex flex-col items-center justify-center p-2 ${
                    isActive ? 'text-purple-400' : 'text-gray-400'
                  }`}
                >
                  <Icon size={24} />
                  {showBadge && (
                    <span className="absolute top-2 right-3 w-2.5 h-2.5 bg-red-500 rounded-full" />
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-purple-400 rounded-t-full"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

