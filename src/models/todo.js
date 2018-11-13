const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  createdDate: { type: String },
  date: { type: Number },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: { type: String, required: true },
  metaData: { type: String },
  image: { type: String },
  toSearch: { type: String },
  finished: { type: Boolean, default: false },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  commentCount: { type: Number, default: 0 },
  added: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  flagged: { type: Boolean, default: false },
});

module.exports = mongoose.model('Todo', todoSchema);
