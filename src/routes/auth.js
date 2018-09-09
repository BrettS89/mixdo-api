const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth');

router.post('/signup', auth.signUp);

router.post('/login', auth.login);

router.post('/facebook', auth.facebookAuth);

module.exports = router;