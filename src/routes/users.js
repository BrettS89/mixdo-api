const express = require('express');
const router = express.Router();
const users = require('../controllers/users');

router.post('/pushtoken', users.savePushToken);

router.get('/find', users.find);

router.get('/find/:date', users.findInfinite);

router.get('/getFollowers/:type', users.getFollowers);

router.post('/followUser', users.followUser);

router.post('/unfollowUser', users.unfollowUser);

router.get('/myProfile', users.myProfile);

router.get('/getProfile/:id', users.getProfile);

router.get('/getUserTodoHistory', users.getUserTodoHistory);

router.get('/search/:name', users.searchUser);

router.post('/profilephoto', users.uploadProfilePhoto);

module.exports = router;
