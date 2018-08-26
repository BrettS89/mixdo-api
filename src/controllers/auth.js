const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwtSecret = require('../config').jwtSecret;

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
      fullName: `${firstName.toLowerCase()} ${lastName.toLowerCase()}`,
      email,
      date: Date.now(),
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
  }

  catch(e) {
    res.status(500).json({ error: 'Authentication Error' });
  }
}


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
  }

	catch(e) {
    res.status(500).json({ error: 'An error occured' });
  }
}
