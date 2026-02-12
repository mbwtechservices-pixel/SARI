'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import TopNav from '@/components/TopNav';
import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/lib/api/axios';
import { useAuth } from '@/lib/context/AuthContext';
import Image from 'next/image';
import { FiCheck } from 'react-icons/fi';

interface Chat {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    profilePicture: string;
    onlineStatus: string;
  }>;
  lastMessage: {
    content: string;
    type: string;
    createdAt: string;
  };
  lastMessageFromCurrentUser?: boolean;
  lastMessageSeenByOther?: boolean;
  lastMessageAt: string;
}

export default function ChatsPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await api.get('/chat/list');
      const data: Chat[] = response.data;

      // Ensure only one conversation per other user (frontend de-duplication as a safety net)
      const uniqueByUser = new Map<string, Chat>();

      data.forEach((chat) => {
        const other = getOtherParticipant(chat);
        if (!other) return;

        const existing = uniqueByUser.get(other._id);
        if (!existing) {
          uniqueByUser.set(other._id, chat);
        }
      });

      setChats(Array.from(uniqueByUser.values()));
    } catch (error) {
      console.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipant = (chat: Chat) => {
    return chat.participants.find((p) => p._id !== user?.id) || chat.participants[0];
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <TopNav />
        <div className="min-h-screen flex items-center justify-center pb-20 pt-16">
          <LoadingSpinner />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <TopNav />
      <div className="min-h-screen pb-20 pt-16">
        <div className="max-w-4xl mx-auto p-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold gradient-text mb-6"
          >
            Chats
          </motion.h1>

          {chats.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No chats yet. Start a conversation with a friend!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {chats.map((chat) => {
                const otherUser = getOtherParticipant(chat);
                return (
                  <motion.div
                    key={chat._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => router.push(`/chat/${otherUser._id}`)}
                    className="glass p-4 flex items-center space-x-4 cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                        {otherUser.profilePicture ? (
                          <Image
                            src={otherUser.profilePicture}
                            alt={otherUser.name}
                            width={56}
                            height={56}
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-white font-semibold text-lg">
                            {otherUser.name[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      {otherUser.onlineStatus === 'online' && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold truncate">{otherUser.name}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(chat.lastMessageAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-sm text-gray-400 truncate flex items-center space-x-1">
                        {chat.lastMessageFromCurrentUser && (
                          <span className="flex items-center mr-1">
                            <FiCheck
                              size={14}
                              className={
                                chat.lastMessageSeenByOther
                                  ? 'text-blue-400'
                                  : 'text-gray-400'
                              }
                            />
                            <FiCheck
                              size={14}
                              className={
                                chat.lastMessageSeenByOther
                                  ? 'text-blue-400 -ml-2'
                                  : 'text-gray-400 -ml-2'
                              }
                            />
                          </span>
                        )}
                        <span>{chat.lastMessage?.content || 'Media'}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}

