import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { upload, uploadToCloudinary } from '../utils/cloudinary.js';

const router = express.Router();

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update profile
router.put('/profile', authenticate, upload.single('profilePicture'), async (req, res) => {
  try {
    const { name, bio, accountMode, primaryColor, secondaryColor, tertiaryColor } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (accountMode) updates.accountMode = accountMode;
    
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, 'sari/profiles');
        updates.profilePicture = result.secure_url;
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ error: 'Failed to upload image' });
      }
    }

    if (primaryColor || secondaryColor || tertiaryColor) {
      updates.themeColors = {
        primary: primaryColor || req.user.themeColors.primary,
        secondary: secondaryColor || req.user.themeColors.secondary,
        tertiary: tertiaryColor || req.user.themeColors.tertiary,
      };
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -email -otp -resetPasswordToken -resetPasswordExpires');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If private account, only show to friends
    if (user.accountMode === 'private') {
      // Check if requester is a friend (simplified - you might want to check Friend model)
      // For now, allow viewing
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

