import express from 'express';
import Friend from '../models/Friend.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Helper to attach friendship status for a list of users
const attachFriendshipStatus = async (currentUserId, users) => {
  const userIds = users.map((u) => u._id);

  const friendships = await Friend.find({
    $or: [
      { requester: currentUserId, recipient: { $in: userIds } },
      { recipient: currentUserId, requester: { $in: userIds } },
    ],
  });

  return users.map((user) => {
    const relation = friendships.find(
      (f) =>
        f.requester.toString() === currentUserId.toString() &&
        f.recipient.toString() === user._id.toString()
    ) ||
    friendships.find(
      (f) =>
        f.recipient.toString() === currentUserId.toString() &&
        f.requester.toString() === user._id.toString()
    );

    let friendshipStatus = 'none';

    if (relation) {
      if (relation.status === 'accepted') {
        friendshipStatus = 'friends';
      } else if (relation.status === 'pending') {
        if (relation.requester.toString() === currentUserId.toString()) {
          friendshipStatus = 'sent';
        } else {
          friendshipStatus = 'received';
        }
      }
    }

    return {
      ...user.toObject(),
      friendshipStatus,
    };
  });
};

// Search users
router.get('/search', authenticate, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.json([]);
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
      _id: { $ne: req.user._id },
      isEmailVerified: true,
    })
      .select('name email profilePicture accountMode onlineStatus themeColors')
      .limit(20);

    const usersWithStatus = await attachFriendshipStatus(req.user._id, users);

    res.json(usersWithStatus);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get public users
router.get('/public', authenticate, async (req, res) => {
  try {
    const users = await User.find({
      accountMode: 'public',
      _id: { $ne: req.user._id },
      isEmailVerified: true,
    })
      .select('name email profilePicture accountMode onlineStatus themeColors')
      .limit(50);

    const usersWithStatus = await attachFriendshipStatus(req.user._id, users);

    res.json(usersWithStatus);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Send friend request
router.post('/request', authenticate, async (req, res) => {
  try {
    const { recipientId } = req.body;

    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot send request to yourself' });
    }

    // Check if request already exists
    const existingRequest = await Friend.findOne({
      $or: [
        { requester: req.user._id, recipient: recipientId },
        { requester: recipientId, recipient: req.user._id },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'Friend request already exists' });
    }

    const friendRequest = new Friend({
      requester: req.user._id,
      recipient: recipientId,
      status: 'pending',
    });

    await friendRequest.save();
    await friendRequest.populate('recipient', 'name email profilePicture onlineStatus');

    res.json(friendRequest);
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Accept friend request
router.put('/accept/:requestId', authenticate, async (req, res) => {
  try {
    const friendRequest = await Friend.findById(req.params.requestId);

    if (!friendRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (friendRequest.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    friendRequest.status = 'accepted';
    await friendRequest.save();
    await friendRequest.populate('requester', 'name email profilePicture onlineStatus');

    res.json(friendRequest);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Reject friend request
router.put('/reject/:requestId', authenticate, async (req, res) => {
  try {
    const friendRequest = await Friend.findById(req.params.requestId);

    if (!friendRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (friendRequest.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Friend.findByIdAndDelete(req.params.requestId);
    res.json({ message: 'Request rejected' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get friend requests (sent and received)
router.get('/requests', authenticate, async (req, res) => {
  try {
    const sentRequests = await Friend.find({
      requester: req.user._id,
      status: 'pending',
    }).populate('recipient', 'name email profilePicture onlineStatus');

    const receivedRequests = await Friend.find({
      recipient: req.user._id,
      status: 'pending',
    }).populate('requester', 'name email profilePicture onlineStatus');

    res.json({
      sent: sentRequests,
      received: receivedRequests,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get friends list
router.get('/list', authenticate, async (req, res) => {
  try {
    const friends = await Friend.find({
      $or: [
        { requester: req.user._id, status: 'accepted' },
        { recipient: req.user._id, status: 'accepted' },
      ],
    })
      .populate('requester', 'name email profilePicture onlineStatus themeColors')
      .populate('recipient', 'name email profilePicture onlineStatus themeColors');

    const friendsList = friends.map((friend) => {
      const friendData =
        friend.requester._id.toString() === req.user._id.toString()
          ? friend.recipient
          : friend.requester;
      return {
        ...friendData.toObject(),
        friendshipId: friend._id,
      };
    });

    res.json(friendsList);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

