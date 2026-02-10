'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/lib/api/axios';
import { FiHeart, FiMessageCircle, FiMoreVertical } from 'react-icons/fi';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/context/AuthContext';

interface Post {
  _id: string;
  user: {
    _id: string;
    name: string;
    profilePicture: string;
  };
  caption: string;
  image: string;
  // Can be an array of user IDs or populated user objects
  likes: Array<string | { _id: string }>;
  comments: any[];
  createdAt: string;
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const response = await api.get('/posts/feed');
      setPosts(response.data);
    } catch (error) {
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const response = await api.put(`/api/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId ? { ...post, likes: response.data.likes } : post
        )
      );
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const hasUserLiked = (post: Post) => {
    if (!user) return false;
    return post.likes.some((like: any) =>
      typeof like === 'string' ? like === user.id : like?._id === user.id
    );
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center pb-20">
          <LoadingSpinner />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen pb-20">
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold gradient-text mb-6"
          >
            Feed
          </motion.h1>

          {posts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No posts yet. Start following people to see their posts!</p>
            </div>
          ) : (
            posts.map((post, index) => {
              const likedByCurrentUser = hasUserLiked(post);
              return (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                      {post.user.profilePicture ? (
                        <Image
                          src={post.user.profilePicture}
                          alt={post.user.name}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold">
                          {post.user.name[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{post.user.name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <FiMoreVertical className="text-gray-400" />
                </div>

                {post.caption && (
                  <p className="text-gray-200">{post.caption}</p>
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

                <div className="flex items-center space-x-4 pt-2 border-t border-white/10">
                  <button
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center space-x-2 ${
                      likedByCurrentUser ? 'text-red-400' : 'text-gray-400'
                    }`}
                  >
                    <FiHeart
                      className={likedByCurrentUser ? 'fill-current' : ''}
                    />
                    <span>{post.likes.length}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-400">
                    <FiMessageCircle />
                    <span>{post.comments.length}</span>
                  </button>
                </div>
              </motion.div>
            );
            })
          )}
        </div>
        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}

