const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  createdDate: { type: String },
  date: { type: Number },
  todo: { type: mongoose.Schema.Types.ObjectId, ref: 'Todo' },
  content: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Comment', commentSchema);
