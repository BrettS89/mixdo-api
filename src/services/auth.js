const jwt = require('jsonwebtoken');
const keys = require('../config');

exports.verifyToken = async (req) => {
  const receivedToken = req.header('authorization');
  const deviceName = req.header('deviceName');
  console.log('token', receivedToken);
  console.log('header', JSON.stringify(req.headers));
  // if(!receivedToken) {
  //   throw { error: 'Unauthorized', status: 401 }; 
  // }

  try {
    await jwt.verify(receivedToken, keys.jwtSecret);
  }
  catch(e) {
    const error = (e.toString().split(' ')[2]);

    if(error === 'signature') {
      throw new Error('Wrong signature');
    }
  }

  const decodedUser = jwt.decode(receivedToken);

  if(decodedUser.user.devices.indexOf(deviceName) === -1) {
    throw { error: 'Unauthorized', status: 401 };
  }

  if(decodedUser === null || !decodedUser.user.email) {
    throw { error: 'Unauthorized', status: 401 };
  }

  const token = jwt.sign({ user: decodedUser.user }, keys.jwtSecret, { expiresIn: 1 });

  return { user: decodedUser.user, token };
}

exports.handleError = (e, res) => {
  if(!e.status) {
    return res.status(500).json(e);
  }
  res.status(e.status).json(e);
}