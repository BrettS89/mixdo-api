const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  createdDate: { type: Date, default: Date.now() },
  date: { type: Number },
  type: { type: String, required: true },
  message: { type: String, required: true },
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  for: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Notification', notificationSchema);
