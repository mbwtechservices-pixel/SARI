import express from 'express';
import Post from '../models/Post.js';
import Friend from '../models/Friend.js';
import { authenticate } from '../middleware/auth.js';
import { upload, uploadToCloudinary } from '../utils/cloudinary.js';

const router = express.Router();

// Create post
router.post('/create', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { caption, visibility } = req.body;

    let imageUrl = '';
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, 'sari/posts');
        imageUrl = result.secure_url;
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ error: 'Failed to upload image' });
      }
    }

    const post = new Post({
      user: req.user._id,
      caption: caption || '',
      image: imageUrl,
      visibility: visibility || 'public',
    });

    await post.save();
    await post.populate('user', 'name profilePicture');

    res.json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get feed (posts from friends and public users)
router.get('/feed', authenticate, async (req, res) => {
  try {
    // Get user's friends
    const friendships = await Friend.find({
      $or: [
        { requester: req.user._id, status: 'accepted' },
        { recipient: req.user._id, status: 'accepted' },
      ],
    });

    const friendIds = friendships.map((f) =>
      f.requester.toString() === req.user._id.toString()
        ? f.recipient
        : f.requester
    );

    // Get posts from friends (friends visibility) and public posts
    const posts = await Post.find({
      $or: [
        { user: { $in: friendIds }, visibility: 'friends' },
        { visibility: 'public' },
        { user: req.user._id },
      ],
    })
      .populate('user', 'name profilePicture')
      .populate('likes', 'name profilePicture')
      .populate('comments.user', 'name profilePicture')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(posts);
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Like/Unlike post
router.put('/:postId/like', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const likeIndex = post.likes.findIndex(
      (id) => id.toString() === req.user._id.toString()
    );

    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add comment
router.post('/:postId/comment', authenticate, async (req, res) => {
  try {
    const { text } = req.body;

    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.comments.push({
      user: req.user._id,
      text,
    });

    await post.save();
    await post.populate('comments.user', 'name profilePicture');

    res.json(post.comments[post.comments.length - 1]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's posts
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate('user', 'name profilePicture')
      .populate('likes', 'name profilePicture')
      .populate('comments.user', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

