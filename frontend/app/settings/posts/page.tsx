'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import TopNav from '@/components/TopNav';
import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/lib/api/axios';
import { useAuth } from '@/lib/context/AuthContext';
import { FiArrowLeft, FiTrash2, FiX } from 'react-icons/fi';
import Image from 'next/image';
import toast from 'react-hot-toast';

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

export default function PostsSettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [deleteConfirmPostId, setDeleteConfirmPostId] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserPosts = async () => {
    if (!user?.id) {
      setPostsLoading(false);
      return;
    }
    setPostsLoading(true);
    try {
      const response = await api.get(`/posts/user/${user.id}`);
      setUserPosts(response.data);
    } catch (error: any) {
      console.error('Failed to load posts:', error);
      toast.error(error.response?.data?.error || 'Failed to load posts');
    } finally {
      setPostsLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    setDeletingPostId(postId);
    try {
      await api.delete(`/posts/${postId}`);
      toast.success('Post deleted successfully');
      setUserPosts(userPosts.filter((post) => post._id !== postId));
      setDeleteConfirmPostId(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete post');
    } finally {
      setDeletingPostId(null);
    }
  };

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
              My Posts
            </motion.h1>
          </div>

          <div className="glass p-6">
            {postsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : userPosts.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>You haven't posted anything yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userPosts.map((post, index) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-white/10 rounded-lg p-4 space-y-3 relative"
                  >
                    <button
                      onClick={() => setDeleteConfirmPostId(post._id)}
                      className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400"
                      title="Delete post"
                    >
                      <FiTrash2 size={18} />
                    </button>
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

