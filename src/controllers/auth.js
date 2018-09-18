const Mixpanel = require('mixpanel');
const key = require('../config').mixpanelToken;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwtSecret = require('../config').jwtSecret;

const mixpanel = Mixpanel.init(key, {
  protocol: 'https'
});

exports.signUp = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  try {
    if(!email || !password) {
      return res.status(422).send({ error: 'You must provide an email and password' });
    }

    const user = await User.findOne({ email });

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
      password: bcrypt.hashSync(req.body.password, 10)
    });

    let savedUser = await newUser.save();

    savedUser = {
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email,
      _id: savedUser._id
    }

    const token = jwt.sign({ user: savedUser }, jwtSecret);
    res.status(200).json({ token });

    mixpanel.track('signup', {
      distinct_id: savedUser._id,
    });
  }

  catch(e) {
    res.status(500).json({ error: 'Authentication Error' });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });

		if(!user){
			return res.status(401).json({ message: 'Invalid login credentials' });
    }
    
		if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid login credentials' })
    }

    user = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      _id: user._id
    }

		const token = jwt.sign({user: user}, jwtSecret);
    res.status(200).json({ token });
    
    mixpanel.track('login', {
      distinct_id: user._id,
    });
  }

	catch(e) {
    res.status(500).json({ error: 'An error occured' });
  }
};

//Auth With Facebook
exports.facebookAuth = async (req, res) => {
  console.log('in');
  try {
    const { email, id, name, picture } = req.body;

    const foundUser = await User.findOne({ email });

    if(foundUser) {
      const user = {
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        email: foundUser.email,
        _id: foundUser._id
      };

      const token = jwt.sign({user: user}, jwtSecret);
      res.status(200).json({ token, status: 'login' });
      return mixpanel.track('login', {
        distinct_id: user._id,
      });
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
    });

    let savedUser = await newUser.save();

    const token = jwt.sign({ user: savedUser }, jwtSecret);
    res.status(200).json({ token, status: 'signup' });
    mixpanel.track('signup', {
      distinct_id: savedUser._id,
    });
  }

  catch(e) {
    res.status(500).json('An error occured');
  }
};  