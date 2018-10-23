const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwtSecret = require('../config').jwtSecret;

const mixpanel = require('../services/mixpanel');

exports.signUp = async (req, res) => {
  console.log('hi');
  const { email, password, firstName, lastName, deviceName } = req.body;
  try {
    if(!email || !password) {
      return res.status(422).send({ error: 'You must provide an email and password' });
    }

    const user = await User.findOne({ email });
    console.log('first');
    if(user) {
      return res.status(422).json({ error: 'Email is in use' });
    }

    const newUser = new User({
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email,
      date: Date.now(),
      createdDate: new Date(Date.now()).toString(),
      password: bcrypt.hashSync(req.body.password, 10),
      devices: [deviceName],
    });

    let savedUser = await newUser.save();

    savedUser = {
      fullName: savedUser.fullName,
      email: savedUser.email,
      _id: savedUser._id,
      devices: savedUser.devices,
    }

    const token = jwt.sign({ user: savedUser }, jwtSecret, { expiresIn: 1 });
    res.status(200).json({ token });

    mixpanel.track('signup', savedUser._id);
  }

  catch(e) {
    console.log(e);
    res.status(500).json({ error: 'Authentication Error' });
  }
};


exports.login = async (req, res) => {
  const { email, password, deviceName } = req.body;
  console.log(deviceName);
  try {
    const user = await User.findOne({ email });

		if(!user){
			return res.status(401).json({ message: 'Invalid login credentials' });
    }
    
		if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid login credentials' })
    }

    const tokenUser = {
      fullName: user.fullName,
      email: user.email,
      _id: user._id,
      devices: user.devices,
    };

		const token = jwt.sign({ user: tokenUser }, jwtSecret, { expiresIn: 1 });
    res.status(200).json({ token });
    console.log(user)
    if(user.devices.indexOf(deviceName) === -1) {
      user.devices.push(deviceName);
      await user.save();
    }
    
    mixpanel.track('login', user._id);
  }

	catch(e) {
    console.log(e);
    res.status(500).json({ error: 'An error occured' });
  }
};

//Auth With Facebook
exports.facebookAuth = async (req, res) => {
  console.log('in');
  try {
    const { email, id, name, picture, deviceName } = req.body;

    const foundUser = await User.findOne({ email });

    if(foundUser) {

      if(foundUser.devices.indexOf(deviceName) === -1) {
        foundUser.devices.push(deviceName);
      }

      const user = {
        fullName: foundUser.fullName,
        email: foundUser.email,
        _id: foundUser._id,
        devices: foundUser.devices,
      };

      const token = jwt.sign({ user }, jwtSecret, { expiresIn: 1 });
      res.status(200).json({ token, status: 'login' });

      await foundUser.save();
      return mixpanel.track('facebook login', user._id);
    }

    const newUser = new User({
      firstName: name.split(' ')[0],
      lastName: name.split(' ')[1],
      fullName: name,
      email,
      createdDate: new Date(Date.now()).toString(),
      date: Date.now(),
      password: bcrypt.hashSync(id),
      photo: picture.data.url,
      devices: [deviceName],
    });

    let savedUser = await newUser.save();

    const user = {
      fullName: savedUser.fullName,
      email: savedUser.email,
      _id: savedUser._id,
      devices: savedUser.devices,
    };

    const token = jwt.sign({ user: savedUser }, jwtSecret, { expiresIn: 1 });
    res.status(200).json({ token, status: 'signup' });

    mixpanel.track('facebook signup', savedUser._id);
  }

  catch(e) {
    res.status(500).json('An error occured');
  }
};  