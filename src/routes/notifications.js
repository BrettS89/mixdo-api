const express = require('express');
const router = express.Router();
const notifications = require('../controllers/notifications');

router.get('/get', notifications.get);

module.exports = router;
