const express = require('express');
const router = express.Router();
const mixpanel = require('../services/mixpanel');
const authService = require('../services/auth');

router.get('/', (req, res) => {
  res.send('Welcome to the mixdo api');
});

router.get('/connection', (req, res) => {
  try {
    const user = authService.verifyToken(req);
    res.status(200).json({ res: 'in', _id: user._id });
    mixpanel.track('login', user._id);
  }
  
  catch(e) {
    authService.handleError(e, res);
  }
});

module.exports = router;