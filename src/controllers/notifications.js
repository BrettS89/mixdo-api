const authService = require('../services/auth');
const User = require('../models/user');
const Notification = require('../models/notification');

exports.get = async (req, res) => {
  try {
    const { user, token } = await authService.verifyToken(req);
    const notifications = await Notification.find({ for: user._id })
      .sort({ date: 'desc' })
      .limit(10)
      .populate('from', ['_id', 'photo'])
      .exec();
      res.status(200).json({ res: notifications, token });
  }

  catch(e) {
    authService.handleError(e, res);
  }
};