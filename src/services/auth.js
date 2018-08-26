const jwt = require('jsonwebtoken');

exports.verifyToken = (req) => {
  const token = req.header('authorization');

  if(!token) {
    throw { error: 'Unauthorized', status: 401 }; 
  }

  const decodedUser = jwt.decode(token);

  if(decodedUser === null || !decodedUser.user.email) {
    throw { error: 'Unauthorized', status: 401 };
  }
  return decodedUser.user;
}

exports.handleError = (e, res) => {
  if(!e.status) {
    return res.status(500).json(e);
  }
  res.status(e.status).json(e);
}