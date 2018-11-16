const express = require('express');
const router = express.Router();
const users = require('../controllers/upload');

router.get('/awsimage/:type', users.awsImage);

router.get('/awsimage2/:type', users.properImageUpload);

module.exports = router;