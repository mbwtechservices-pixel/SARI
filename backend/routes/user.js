import express from 'express';
import User from '../models/User.js';
import Friend from '../models/Friend.js';
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

// Change password
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
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

    // Check friendship status
    let friendshipStatus = 'none';
    if (req.user._id.toString() !== user._id.toString()) {
      const friendship = await Friend.findOne({
        $or: [
          { requester: req.user._id, recipient: user._id },
          { requester: user._id, recipient: req.user._id },
        ],
      });

      if (friendship) {
        if (friendship.status === 'accepted') {
          friendshipStatus = 'friends';
        } else if (friendship.status === 'pending') {
          if (friendship.requester.toString() === req.user._id.toString()) {
            friendshipStatus = 'sent';
          } else {
            friendshipStatus = 'received';
          }
        }
      }
    }

    const userObj = user.toObject();
    userObj.friendshipStatus = friendshipStatus;

    res.json(userObj);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

