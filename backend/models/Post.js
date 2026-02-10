import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  caption: {
    type: String,
    default: '',
    maxlength: 2000,
  },
  image: {
    type: String,
    default: '',
  },
  visibility: {
    type: String,
    enum: ['public', 'friends'],
    default: 'public',
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [commentSchema],
}, {
  timestamps: true,
});

postSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Post', postSchema);

