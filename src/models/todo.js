const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  createdDate: { type: Date },
  date: { type: Number },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: { type: String, required: true },
  metaData: { type: String },
  toSearch: { type: String },
  finished: { type: Boolean, default: false },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  added: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Todo', todoSchema);
