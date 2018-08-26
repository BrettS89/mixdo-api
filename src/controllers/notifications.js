const authService = require('../services/auth');
const User = require('../models/user');
const Notification = require('../models/notification');

exports.get = async (req, res) => {
  try {
    const user = authService.verifyToken(req);
    console.log(user);
    const notifications = await Notification.find({ for: user._id })
      .sort({ date: 'desc' })
      .limit(10)
      .populate('from', ['_id', 'photo'])
      .exec();
      console.log(notifications);
      res.status(200).json(notifications);
  }

  catch(e) {
    authService.handleError(e, res);
  }
};