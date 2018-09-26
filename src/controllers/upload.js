const AWS = require('aws-sdk');
const keys = require('../config/index');
const authService = require('../services/auth');
const todoService = require('../services/todos');
const Todo = require('../models/todo');
const User = require('../models/user');
const Notification = require('../models/notification');
const notificationTypes = require('../config/index');
const uuid = require('uuid/v1');

const s3 = new AWS.S3({
  accessKeyId: keys.accessKeyId,
  secretAccessKey: keys.secretAccessKey,
});

// Add a todo /////////////////////////////////////////////////

exports.awsImage = async (req, res) => {
  try {
    const { user, token } = await authService.verifyToken(req);

    const key = `${user._id}/${uuid()}.${req.params.type}`

    s3.getSignedUrl('putObject', {
      Bucket: keys.bucket,
      ContentType: `image/${req.params.type}`,
      ContentEncoding: 'base64',
      Key: key
    }, (err, url) => {
      if(err) {
        return res.status(500).json({ error: 'an error occured' });
      }
      res.status(200).json({ res: { key, url }, token });
    });
  }

  catch(e) {
    authService.handleError(e, res);
  }
};
