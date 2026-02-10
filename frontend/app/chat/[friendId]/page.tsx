'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/lib/api/axios';
import { useSocket } from '@/lib/context/SocketContext';
import { useAuth } from '@/lib/context/AuthContext';
import { FiArrowLeft, FiImage, FiSend, FiSmile } from 'react-icons/fi';
import Image from 'next/image';
import EmojiPicker from 'emoji-picker-react';
import toast from 'react-hot-toast';

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    profilePicture: string;
  };
  content: string;
  type: 'text' | 'image' | 'audio' | 'emoji';
  mediaUrl: string;
  seenBy: Array<{ userId: string; seenAt: string }>;
  createdAt: string;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { socket } = useSocket();
  const { user } = useAuth();
  const [friend, setFriend] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (params.friendId) {
      initializeChat();
    }
  }, [params.friendId]);

  useEffect(() => {
    if (socket && chatId) {
      socket.emit('join_chat', chatId);

      socket.on('receive_message', (data: Message) => {
        setMessages((prev) => [...prev, data]);
        scrollToBottom();
      });

      socket.on('user_typing', (data: { userId: string; isTyping: boolean }) => {
        if (data.userId !== user?.id) {
          setTyping(data.isTyping);
        }
      });

      socket.on('message_seen', (data: { messageId: string }) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.messageId
              ? { ...msg, seenBy: [...(msg.seenBy || []), { userId: user?.id || '', seenAt: new Date().toISOString() }] }
              : msg
          )
        );
      });

      return () => {
        socket.emit('leave_chat', chatId);
        socket.off('receive_message');
        socket.off('user_typing');
        socket.off('message_seen');
      };
    }
  }, [socket, chatId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      const response = await api.post('/chat/get-or-create', {
        friendId: params.friendId,
      });
      setChatId(response.data._id);
      setFriend(
        response.data.participants.find((p: any) => p._id !== user?.id)
      );
      
      const messagesResponse = await api.get(`/api/chat/${response.data._id}/messages`);
      setMessages(messagesResponse.data);
    } catch (error) {
      toast.error('Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (type: 'text' | 'image' | 'audio' = 'text', mediaUrl = '') => {
    // Prevent sending if chat is not initialized correctly
    if (!chatId) {
      toast.error('Chat is not ready yet. Please wait a moment and try again.');
      return;
    }

    if (!newMessage.trim() && type === 'text' && !mediaUrl) return;

    try {
      const formData = new FormData();
      formData.append('content', newMessage);
      formData.append('type', type);

      const response = await api.post(`/api/chat/${chatId}/message`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (socket) {
        socket.emit('send_message', {
          chatId,
          message: response.data,
        });
      }

      setMessages((prev) => [...prev, response.data]);
      setNewMessage('');
      scrollToBottom();
      
      // Mark as seen
      if (socket) {
        socket.emit('mark_seen', {
          chatId,
          messageId: response.data._id,
        });
      }
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!chatId) {
      toast.error('Chat is not ready yet. Please wait a moment and try again.');
      return;
    }

    const formData = new FormData();
    formData.append('media', file);
    formData.append('content', '');
    formData.append('type', 'image');

    try {
      const response = await api.post(`/api/chat/${chatId}/message`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (socket) {
        socket.emit('send_message', {
          chatId,
          message: response.data,
        });
      }

      setMessages((prev) => [...prev, response.data]);
      scrollToBottom();
      
      // Mark as seen
      if (socket) {
        socket.emit('mark_seen', {
          chatId,
          messageId: response.data._id,
        });
      }
    } catch (error) {
      toast.error('Failed to send image');
    }
  };

  const handleTyping = () => {
    if (socket && chatId) {
      socket.emit('typing', { chatId, isTyping: true });
      setTimeout(() => {
        socket.emit('typing', { chatId, isTyping: false });
      }, 1000);
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    setNewMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        {/* Header */}
        <div className="glass-dark border-b border-white/10 p-4 flex items-center space-x-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <FiArrowLeft size={24} />
          </button>
          <div className="flex items-center space-x-3 flex-1">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                {friend?.profilePicture ? (
                  <Image
                    src={friend.profilePicture}
                    alt={friend.name}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold">
                    {friend?.name[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              {friend?.onlineStatus === 'online' && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900" />
              )}
            </div>
            <div>
              <p className="font-semibold">{friend?.name}</p>
              <p className="text-xs text-gray-400">
                {friend?.onlineStatus === 'online' ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => {
              const senderId =
                typeof message.sender === 'string'
                  ? message.sender
                  : message.sender?._id;

              // For a one-to-one chat, if the sender is NOT the friend, we treat it as "own" message.
              // This is more robust even if auth/user IDs get out of sync across tabs/devices.
              const friendId =
                typeof friend === 'string'
                  ? friend
                  : friend?._id;
              const isOwn = friendId ? senderId !== friendId : senderId === user?.id;
              return (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md ${
                      isOwn
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl rounded-tr-sm'
                        : 'glass rounded-2xl rounded-tl-sm'
                    } p-3`}
                  >
                    {message.type === 'image' && message.mediaUrl && (
                      <div className="mb-2 rounded-lg overflow-hidden">
                        <Image
                          src={message.mediaUrl}
                          alt="Chat image"
                          width={300}
                          height={300}
                          className="w-full h-auto"
                        />
                      </div>
                    )}
                    {message.type === 'audio' && message.mediaUrl && (
                      <audio controls className="w-full">
                        <source src={message.mediaUrl} />
                      </audio>
                    )}
                    {message.content && (
                      <p className="text-sm">{message.content}</p>
                    )}
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {isOwn && message.seenBy && message.seenBy.length > 0 && (
                        <span className="ml-2">✓✓</span>
                      )}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {typing && (
            <div className="flex justify-start">
              <div className="glass rounded-2xl rounded-tl-sm p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="glass-dark border-t border-white/10 p-4">
          <div className="relative">
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-2 left-0">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <FiSmile size={24} />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <FiImage size={24} />
              </button>
              <button
                onClick={() => handleSendMessage()}
                className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                <FiSend size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

