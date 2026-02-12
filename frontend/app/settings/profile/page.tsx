'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import TopNav from '@/components/TopNav';
import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/lib/api/axios';
import { useAuth } from '@/lib/context/AuthContext';
import { FiImage, FiEdit2, FiX, FiArrowLeft } from 'react-icons/fi';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function ProfileSettingsPage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    accountMode: user?.accountMode || 'public',
    primaryColor: user?.themeColors?.primary || '#6366f1',
    secondaryColor: user?.themeColors?.secondary || '#8b5cf6',
    tertiaryColor: user?.themeColors?.tertiary || '#ec4899',
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(user?.profilePicture || '');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        accountMode: user.accountMode || 'public',
        primaryColor: user.themeColors?.primary || '#6366f1',
        secondaryColor: user.themeColors?.secondary || '#8b5cf6',
        tertiaryColor: user.themeColors?.tertiary || '#ec4899',
      });
      setProfilePicturePreview(user.profilePicture || '');
    }
  }, [user]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitFormData = new FormData();
      submitFormData.append('name', formData.name);
      submitFormData.append('bio', formData.bio);
      submitFormData.append('accountMode', formData.accountMode);
      submitFormData.append('primaryColor', formData.primaryColor);
      submitFormData.append('secondaryColor', formData.secondaryColor);
      submitFormData.append('tertiaryColor', formData.tertiaryColor);
      
      if (profilePicture) {
        submitFormData.append('profilePicture', profilePicture);
      }

      const response = await api.put('/user/profile', submitFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateUser(response.data);
      setIsEditing(false);
      setProfilePicture(null);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        accountMode: user.accountMode || 'public',
        primaryColor: user.themeColors?.primary || '#6366f1',
        secondaryColor: user.themeColors?.secondary || '#8b5cf6',
        tertiaryColor: user.themeColors?.tertiary || '#ec4899',
      });
      setProfilePicturePreview(user.profilePicture || '');
      setProfilePicture(null);
    }
    setIsEditing(false);
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
              Profile Settings
            </motion.h1>
          </div>

          <div className="glass p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Profile</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  <FiEdit2 size={18} />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                      {profilePicturePreview ? (
                        <Image
                          src={profilePicturePreview}
                          alt="Profile"
                          width={96}
                          height={96}
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold text-3xl">
                          {formData.name[0]?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full cursor-pointer hover:bg-purple-700">
                      <FiImage size={20} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    maxLength={500}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>

                {/* Account Mode */}
                <div>
                  <label className="block text-sm font-medium mb-2">Account Mode</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        value="public"
                        checked={formData.accountMode === 'public'}
                        onChange={(e) => setFormData({ ...formData, accountMode: e.target.value as 'public' | 'private' })}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span>Public</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        value="private"
                        checked={formData.accountMode === 'private'}
                        onChange={(e) => setFormData({ ...formData, accountMode: e.target.value as 'public' | 'private' })}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span>Private</span>
                    </label>
                  </div>
                </div>

                {/* Theme Colors */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Theme Colors</h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Primary Color</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-16 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Secondary Color</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        className="w-16 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tertiary Color</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={formData.tertiaryColor}
                        onChange={(e) => setFormData({ ...formData, tertiaryColor: e.target.value })}
                        className="w-16 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.tertiaryColor}
                        onChange={(e) => setFormData({ ...formData, tertiaryColor: e.target.value })}
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <LoadingSpinner size="sm" /> : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 bg-gray-600 rounded-lg font-semibold hover:bg-gray-700 transition-all flex items-center space-x-2"
                  >
                    <FiX size={18} />
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Profile Picture */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                    {user?.profilePicture ? (
                      <Image
                        src={user.profilePicture}
                        alt="Profile"
                        width={96}
                        height={96}
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold text-3xl">
                        {user?.name[0]?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-400">Name</label>
                  <p className="text-lg">{user?.name || 'Not set'}</p>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-400">Bio</label>
                  <p className="text-gray-200">{user?.bio || 'No bio yet'}</p>
                </div>

                {/* Account Mode */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-400">Account Mode</label>
                  <p className="text-lg capitalize">{user?.accountMode || 'public'}</p>
                </div>

                {/* Theme Colors */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-400">Theme Colors</label>
                  <div className="flex space-x-2 mt-2">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white/20"
                      style={{ backgroundColor: user?.themeColors?.primary || '#6366f1' }}
                    />
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white/20"
                      style={{ backgroundColor: user?.themeColors?.secondary || '#8b5cf6' }}
                    />
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white/20"
                      style={{ backgroundColor: user?.themeColors?.tertiary || '#ec4899' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}

