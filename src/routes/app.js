const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Welcome to the checkm8 api');
});

router.get('/connection', (req, res) => {
  res.send('in');
});

module.exports = router;