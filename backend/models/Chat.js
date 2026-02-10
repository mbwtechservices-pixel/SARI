import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    enum: ['text', 'image', 'audio', 'emoji'],
    default: 'text',
  },
  mediaUrl: {
    type: String,
    default: '',
  },
  seenBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    seenAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  messages: [messageSchema],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for faster queries
chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessageAt: -1 });

export default mongoose.model('Chat', chatSchema);

