'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/lib/api/axios';
import { FiSearch, FiUserPlus, FiCheck, FiX } from 'react-icons/fi';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture: string;
  onlineStatus: string;
  themeColors?: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  friendshipStatus?: 'none' | 'sent' | 'received' | 'friends';
}

interface FriendRequest {
  _id: string;
  requester: User;
  recipient: User;
  status: string;
}

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState<'search' | 'requests' | 'friends'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [publicUsers, setPublicUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [requests, setRequests] = useState<{ sent: FriendRequest[]; received: FriendRequest[] }>({
    sent: [],
    received: [],
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (activeTab === 'friends') {
      fetchFriends();
    } else if (activeTab === 'requests') {
      fetchRequests();
    } else if (activeTab === 'search') {
      fetchPublicUsers();
    }
  }, [activeTab]);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const response = await api.get('/friends/list');
      setFriends(response.data);
    } catch (error) {
      toast.error('Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('/friends/requests');
      setRequests(response.data);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/friends/public');
      setPublicUsers(response.data);

      // When there's no search query, show all public users
      if (!searchQuery.trim()) {
        setSearchResults(response.data);
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      // If query is cleared, show all public users by default
      setSearchResults(publicUsers);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/api/friends/search?query=${query}`);
      setSearchResults(response.data);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (userId: string) => {
    try {
      await api.post('/friends/request', { recipientId: userId });
      toast.success('Friend request sent!');
      handleSearch(searchQuery);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send request');
    }
  };

  const acceptRequest = async (requestId: string) => {
    try {
      await api.put(`/api/friends/accept/${requestId}`);
      toast.success('Friend request accepted!');
      fetchRequests();
      fetchFriends();
    } catch (error) {
      toast.error('Failed to accept request');
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      await api.put(`/api/friends/reject/${requestId}`);
      toast.success('Friend request rejected');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  const openChat = (friendId: string) => {
    router.push(`/chat/${friendId}`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen pb-20">
        <div className="max-w-4xl mx-auto p-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold gradient-text mb-6"
          >
            Friends
          </motion.h1>

          <div className="flex space-x-2 mb-6">
            {(['search', 'requests', 'friends'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'search' && (
            <div className="space-y-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                            {user.profilePicture ? (
                              <Image
                                src={user.profilePicture}
                                alt={user.name}
                                width={48}
                                height={48}
                                className="object-cover"
                              />
                            ) : (
                              <span className="text-white font-semibold">
                                {user.name[0].toUpperCase()}
                              </span>
                            )}
                          </div>
                          {user.onlineStatus === 'online' && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                      </div>
                      {user.friendshipStatus === 'friends' ? (
                        <span className="px-3 py-1 rounded-lg bg-green-600 text-sm">
                          Friends
                        </span>
                      ) : user.friendshipStatus === 'sent' ? (
                        <button
                          disabled
                          className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-yellow-600 text-sm opacity-80 cursor-default"
                        >
                          <FiCheck size={16} />
                          <span>Sent</span>
                        </button>
                      ) : user.friendshipStatus === 'received' ? (
                        <span className="px-3 py-1 rounded-lg bg-blue-600 text-sm">
                          Requested you
                        </span>
                      ) : (
                        <button
                          onClick={() => sendFriendRequest(user._id)}
                          className="p-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <FiUserPlus size={20} />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <>
                  {requests.received.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Received Requests</h3>
                      <div className="space-y-2">
                        {requests.received.map((request) => (
                          <motion.div
                            key={request._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass p-4 flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                                {request.requester.profilePicture ? (
                                  <Image
                                    src={request.requester.profilePicture}
                                    alt={request.requester.name}
                                    width={48}
                                    height={48}
                                    className="object-cover"
                                  />
                                ) : (
                                  <span className="text-white font-semibold">
                                    {request.requester.name[0].toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <p className="font-semibold">{request.requester.name}</p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => acceptRequest(request._id)}
                                className="p-2 bg-green-600 rounded-lg hover:bg-green-700"
                              >
                                <FiCheck size={20} />
                              </button>
                              <button
                                onClick={() => rejectRequest(request._id)}
                                className="p-2 bg-red-600 rounded-lg hover:bg-red-700"
                              >
                                <FiX size={20} />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {requests.sent.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Sent Requests</h3>
                      <div className="space-y-2">
                        {requests.sent.map((request) => (
                          <motion.div
                            key={request._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass p-4 flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                                {request.recipient.profilePicture ? (
                                  <Image
                                    src={request.recipient.profilePicture}
                                    alt={request.recipient.name}
                                    width={48}
                                    height={48}
                                    className="object-cover"
                                  />
                                ) : (
                                  <span className="text-white font-semibold">
                                    {request.recipient.name[0].toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <p className="font-semibold">{request.recipient.name}</p>
                            </div>
                            <span className="text-gray-400 text-sm">Pending</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {requests.received.length === 0 && requests.sent.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <p>No friend requests</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'friends' && (
            <div className="space-y-2">
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>No friends yet. Start searching to add friends!</p>
                </div>
              ) : (
                friends.map((friend) => (
                  <motion.div
                    key={friend._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => openChat(friend._id)}
                    className="glass p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                          {friend.profilePicture ? (
                            <Image
                              src={friend.profilePicture}
                              alt={friend.name}
                              width={48}
                              height={48}
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-white font-semibold">
                              {friend.name[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        {friend.onlineStatus === 'online' && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{friend.name}</p>
                        <p className="text-sm text-gray-400">
                          {friend.onlineStatus === 'online' ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}

