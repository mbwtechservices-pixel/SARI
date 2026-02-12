'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import TopNav from '@/components/TopNav';
import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/lib/api/axios';
import { FiImage, FiX } from 'react-icons/fi';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function UploadPage() {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends'>('public');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim() && !image) {
      toast.error('Please add a caption or image');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('caption', caption);
      formData.append('visibility', visibility);
      if (image) {
        formData.append('image', image);
      }

      await api.post('/posts/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Post created successfully!');
      router.push('/home');
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <TopNav />
      <div className="min-h-screen pb-20 pt-16">
        <div className="max-w-2xl mx-auto p-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold gradient-text mb-6"
          >
            Create Post
          </motion.h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="glass p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Caption</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="What's on your mind?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Image (Optional)</label>
                {imagePreview ? (
                  <div className="relative">
                    <div className="relative w-full h-64 rounded-lg overflow-hidden">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setImagePreview('');
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-600 rounded-full hover:bg-red-700"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                    <FiImage size={48} className="text-gray-400 mb-2" />
                    <span className="text-gray-400">Click to upload image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Visibility</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value="public"
                      checked={visibility === 'public'}
                      onChange={(e) => setVisibility(e.target.value as 'public' | 'friends')}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span>Public</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value="friends"
                      checked={visibility === 'friends'}
                      onChange={(e) => setVisibility(e.target.value as 'public' | 'friends')}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span>Friends Only</span>
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Post'}
            </button>
          </form>
        </div>
        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}

