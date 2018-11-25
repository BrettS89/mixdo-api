const express = require('express');
const router = express.Router();
const mixpanel = require('../services/mixpanel');
const authService = require('../services/auth');

router.get('/', (req, res) => {
  res.send('Welcome to the mixdo api');
});

router.get('/connection', async (req, res) => {
  try {
    // const { user, token } = await authService.verifyToken(req);
    res.status(200).json({ res: 'in' });
    // mixpanel.track('login', user._id);
  }
  
  catch(e) {
    authService.handleError(e, res);
  }
});

module.exports = router;
