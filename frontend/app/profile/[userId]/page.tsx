'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import TopNav from '@/components/TopNav';
import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/lib/api/axios';
import { useAuth } from '@/lib/context/AuthContext';
import { FiArrowLeft, FiUserPlus, FiCheck, FiMessageCircle, FiTrash2, FiX } from 'react-icons/fi';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  profilePicture: string;
  bio: string;
  accountMode: 'public' | 'private';
  themeColors?: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  friendshipStatus?: 'none' | 'sent' | 'received' | 'friends';
}

interface Post {
  _id: string;
  user: {
    _id: string;
    name: string;
    profilePicture: string;
  };
  caption: string;
  image: string;
  likes: Array<string | { _id: string }>;
  comments: any[];
  createdAt: string;
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [deleteConfirmPostId, setDeleteConfirmPostId] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  useEffect(() => {
    if (params.userId) {
      fetchUserProfile();
    }
  }, [params.userId]);

  useEffect(() => {
    if (user && user.accountMode === 'public' && !isCurrentUser) {
      fetchUserPosts();
    } else if (isCurrentUser) {
      fetchUserPosts();
    }
  }, [user, isCurrentUser]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/user/${params.userId}`);
      const userData = response.data;
      setUser(userData);
      setIsCurrentUser(currentUser?.id === userData._id);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load profile');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    if (!params.userId) return;
    setPostsLoading(true);
    try {
      const response = await api.get(`/posts/user/${params.userId}`);
      setPosts(response.data);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setPostsLoading(false);
    }
  };

  const sendFriendRequest = async () => {
    if (!user) return;
    try {
      await api.post('/friends/request', { recipientId: user._id });
      toast.success('Friend request sent!');
      fetchUserProfile(); // Refresh to update friendship status
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send request');
    }
  };

  const openChat = () => {
    if (user) {
      router.push(`/chat/${user._id}`);
    }
  };

  const handleDeletePost = async (postId: string) => {
    setDeletingPostId(postId);
    try {
      await api.delete(`/posts/${postId}`);
      toast.success('Post deleted successfully');
      setPosts(posts.filter((post) => post._id !== postId));
      setDeleteConfirmPostId(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete post');
    } finally {
      setDeletingPostId(null);
    }
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

  if (!user) {
    return null;
  }

  const canViewPosts = isCurrentUser || user.accountMode === 'public' || user.friendshipStatus === 'friends';

  return (
    <ProtectedRoute>
      <TopNav />
      <div className="min-h-screen pb-20 pt-16">
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <FiArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold gradient-text">Profile</h1>
          </div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 space-y-6"
          >
            {/* Profile Picture and Info */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                {user.profilePicture ? (
                  <Image
                    src={user.profilePicture}
                    alt={user.name}
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold text-3xl">
                    {user.name[0]?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                {user.bio && (
                  <p className="text-gray-300 mt-2">{user.bio}</p>
                )}
                <p className="text-sm text-gray-400 mt-1 capitalize">
                  {user.accountMode} Account
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            {!isCurrentUser && (
              <div className="flex space-x-3">
                {user.friendshipStatus === 'friends' ? (
                  <button
                    onClick={openChat}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center space-x-2"
                  >
                    <FiMessageCircle size={20} />
                    <span>Message</span>
                  </button>
                ) : user.friendshipStatus === 'sent' ? (
                  <button
                    disabled
                    className="flex-1 py-3 bg-yellow-600 rounded-lg font-semibold opacity-80 cursor-default flex items-center justify-center space-x-2"
                  >
                    <FiCheck size={20} />
                    <span>Request Sent</span>
                  </button>
                ) : user.friendshipStatus === 'received' ? (
                  <span className="flex-1 py-3 bg-blue-600 rounded-lg font-semibold text-center">
                    Requested you
                  </span>
                ) : (
                  <button
                    onClick={sendFriendRequest}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center space-x-2"
                  >
                    <FiUserPlus size={20} />
                    <span>Add Friend</span>
                  </button>
                )}
              </div>
            )}

            {/* Theme Colors */}
            {user.themeColors && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Theme Colors</label>
                <div className="flex space-x-2">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white/20"
                    style={{ backgroundColor: user.themeColors.primary || '#6366f1' }}
                  />
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white/20"
                    style={{ backgroundColor: user.themeColors.secondary || '#8b5cf6' }}
                  />
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white/20"
                    style={{ backgroundColor: user.themeColors.tertiary || '#ec4899' }}
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* Posts Section */}
          {canViewPosts ? (
            <div className="glass p-6">
              <h2 className="text-xl font-semibold mb-4">Posts</h2>
              {postsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No posts yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post, index) => (
                    <motion.div
                      key={post._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-white/10 rounded-lg p-4 space-y-3 relative"
                    >
                      {isCurrentUser && (
                        <div className="absolute top-4 right-4">
                          <button
                            onClick={() => setDeleteConfirmPostId(post._id)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400"
                            title="Delete post"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      )}
                      {post.caption && (
                        <p className="text-gray-200 pr-10">{post.caption}</p>
                      )}
                      {post.image && (
                        <div className="rounded-lg overflow-hidden">
                          <Image
                            src={post.image}
                            alt={post.caption || 'Post image'}
                            width={600}
                            height={400}
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>{post.likes.length} likes</span>
                        <span>{post.comments.length} comments</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="glass p-6 text-center">
              <p className="text-gray-400">
                This account is private. Posts are only visible to friends.
              </p>
            </div>
          )}
        </div>
        <BottomNav />
      </div>

      {/* Delete Post Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmPostId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmPostId(null)}
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
                  <h3 className="text-lg sm:text-xl font-bold">Delete Post</h3>
                  <button
                    onClick={() => setDeleteConfirmPostId(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                  >
                    <FiX size={20} />
                  </button>
                </div>
                <p className="text-sm sm:text-base text-gray-300">
                  Are you sure you want to delete this post? This action cannot be undone.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:space-x-3 sm:gap-0">
                  <button
                    onClick={() => setDeleteConfirmPostId(null)}
                    disabled={deletingPostId !== null}
                    className="flex-1 py-3 px-4 bg-gray-600 rounded-lg font-semibold hover:bg-gray-700 transition-all text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeletePost(deleteConfirmPostId)}
                    disabled={deletingPostId !== null}
                    className="flex-1 py-3 px-4 bg-red-600 rounded-lg font-semibold hover:bg-red-700 transition-all text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {deletingPostId === deleteConfirmPostId ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <FiTrash2 size={18} />
                        <span>Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </ProtectedRoute>
  );
}

