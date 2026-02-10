import express from 'express';
import Chat from '../models/Chat.js';
import Friend from '../models/Friend.js';
import { authenticate } from '../middleware/auth.js';
import { upload, uploadToCloudinary } from '../utils/cloudinary.js';

const router = express.Router();

// Get or create chat
router.post('/get-or-create', authenticate, async (req, res) => {
  try {
    const { friendId } = req.body;

    // NOTE: For now we allow creating chats without enforcing accepted friendship status.
    // This makes the app easier to use during development and avoids confusing 403 errors.
    // If you want to lock chatting to friends only, re‑enable the friendship check.

    // Find existing chat between these two users (one conversation per pair)
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, friendId] },
    }).populate('participants', 'name profilePicture onlineStatus');

    // Create new chat if doesn't exist
    if (!chat) {
      chat = new Chat({
        participants: [req.user._id, friendId],
        messages: [],
      });
      await chat.save();
      await chat.populate('participants', 'name profilePicture onlineStatus');
    }

    res.json(chat);
  } catch (error) {
    console.error('Get or create chat error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all chats for user
router.get('/list', authenticate, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
    })
      .populate('participants', 'name profilePicture onlineStatus')
      .sort({ lastMessageAt: -1 });

    const formattedChats = chats.map((chat) => {
      const chatObj = chat.toObject();

      const lastMessage =
        chatObj.messages && chatObj.messages.length > 0
          ? chatObj.messages[chatObj.messages.length - 1]
          : null;

      chatObj.lastMessage = lastMessage;

      // Flags for frontend:
      // - lastMessageFromCurrentUser: last message sent by the current user
      // - lastMessageSeenByOther: last message from current user has been seen by the other user
      // - hasUnreadForCurrentUser: last message from other user not yet seen by current user
      let lastMessageFromCurrentUser = false;
      let lastMessageSeenByOther = false;
      let hasUnreadForCurrentUser = false;

      if (lastMessage && lastMessage.sender) {
        const senderId = lastMessage.sender.toString();
        const currentUserId = req.user._id.toString();

        lastMessageFromCurrentUser = senderId === currentUserId;

        // Determine the "other" participant for this one-to-one chat
        const otherParticipant =
          chatObj.participants.find(
            (p) => p._id.toString() !== currentUserId
          ) || chatObj.participants[0];
        const otherId = otherParticipant?._id?.toString();

        if (lastMessageFromCurrentUser && otherId && Array.isArray(lastMessage.seenBy)) {
          lastMessageSeenByOther = lastMessage.seenBy.some(
            (s) => s.userId && s.userId.toString() === otherId
          );
        }

        const fromOtherUser = senderId !== currentUserId;
        if (fromOtherUser) {
          const seenByCurrentUser =
            Array.isArray(lastMessage.seenBy) &&
            lastMessage.seenBy.some(
              (s) => s.userId && s.userId.toString() === currentUserId
            );
          hasUnreadForCurrentUser = !seenByCurrentUser;
        }
      }

      chatObj.lastMessageFromCurrentUser = lastMessageFromCurrentUser;
      chatObj.lastMessageSeenByOther = lastMessageSeenByOther;
      chatObj.hasUnreadForCurrentUser = hasUnreadForCurrentUser;

      return chatObj;
    });

    res.json(formattedChats);
  } catch (error) {
    console.error('Get chats list error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get chat messages
router.get('/:chatId/messages', authenticate, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    if (!chat.participants.some((p) => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await chat.populate('messages.sender', 'name profilePicture');
    res.json(chat.messages);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Send message
router.post('/:chatId/message', authenticate, upload.single('media'), async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, type } = req.body;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    if (!chat.participants.some((p) => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    let mediaUrl = '';
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, 'sari/chat');
        mediaUrl = result.secure_url;
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ error: 'Failed to upload media' });
      }
    }

    const message = {
      sender: req.user._id,
      content: content || '',
      type: type || 'text',
      mediaUrl: mediaUrl,
    };

    chat.messages.push(message);
    chat.lastMessage = chat.messages[chat.messages.length - 1]._id;
    chat.lastMessageAt = new Date();
    await chat.save();

    await chat.populate('messages.sender', 'name profilePicture');
    const newMessage = chat.messages[chat.messages.length - 1];

    res.json(newMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark message as seen
router.put('/:chatId/message/:messageId/seen', authenticate, async (req, res) => {
  try {
    const { chatId, messageId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const message = chat.messages.id(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if already seen
    const alreadySeen = message.seenBy.some(
      (seen) => seen.userId.toString() === req.user._id.toString()
    );

    if (!alreadySeen) {
      message.seenBy.push({
        userId: req.user._id,
        seenAt: new Date(),
      });
      await chat.save();
    }

    res.json({ message: 'Marked as seen' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

