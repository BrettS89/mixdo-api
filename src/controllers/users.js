const authService = require('../services/auth');
const Todo = require('../models/todo');
const User = require('../models/user');
const Notification = require('../models/notification');
const FOLLOWED = require('../config/index').FOLLOWED;


//Find Friends ////////////////////////////////////////////////////

exports.find = async (req, res) => {
  try {
    const user = authService.verifyToken(req);
    const users = await User.find({}, ['_id', 'firstName', 'lastName', 'photo'])
      .where('_id').ne(user._id)
      // .sort({ date: 'desc' })
      .limit(30)
      .exec();

    const following = await User.findById(user._id, 'following')
      .populate('following', ['_id'])
      .exec();
    
    res.status(200).json({ users, following });
  }

  catch(e) {
    res.status(200).json({ users: 'no users' });
  }
};

//Get Followers /////////////////////////////////////////////////////

exports.getFollowers = async (req, res) => {
  if(req.params.type === 'Followers') {

    try {
      const user = authService.verifyToken(req);
      const followers = await User.findById(user._id, 'followers')
        .populate('followers', ['_id', 'firstName', 'lastName', 'photo'])
        // .limit(20)
        .lean()
        .exec();
  
      try {
        let following = await User.findById(user._id, 'following')
        .populate('following', ['_id'])
        .lean()
        .exec();
  
  
        const following1 = following.following.map(user => user._id.toString());
          const followers1 = followers.followers.map(follower => {
            if(following1.indexOf(follower._id.toString()) > -1) {
              return {
                _id: follower._id,
                firstName: follower.firstName ? follower.firstName : '',
                lastName: follower.lastName ? follower.lastName :'',
                photo: follower.photo ? follower.photo : false,
                following: true
              };
            }
            return follower;
          });
  
        return res.status(200).json({followers1});  
      }  
      catch(e) {
        const followers1 = followers.followers;
        res.status(200).json({followers1});
      }    
    }
    catch(e) {
      res.status(200).json({ users: 'no users' });
    }
  }

  try {
    const user = authService.verifyToken(req);
    let following = await User.findById(user._id, 'following')
      .populate('following', ['_id', 'firstName', 'lastName', 'photo'])
      .lean()
      .exec();
      const followers1 = following.following.map(user => {
        return {
          _id: user._id,
          firstName: user.firstName ? user.firstName : '',
          lastName: user.lastName ? user.lastName :'',
          photo: user.photo ? user.photo : false,
          following: true
        };
      });
      res.status(200).json({followers1});
  }

  catch(e) {
    res.status(200).json({ users: 'no users' });
  }

};

//Follow User ///////////////////////////////////////////////////////

exports.followUser = async (req, res) => {
  try {
    const user = authService.verifyToken(req);
    const foundUser = await User.findById(user._id);
    foundUser.following.push(req.body.id);

    const followedUser = await User.findById(req.body.id);
    followedUser.followers.push(foundUser._id);

    const notification = new Notification({
      date: Date.now(),
      type: FOLLOWED,
      message: `${foundUser.firstName} ${foundUser.lastName} started following you`,
      from: foundUser._id,
      for: req.body.id
    });

    await foundUser.save();
    await followedUser.save();
    await notification.save();

    res.status(200).json({ success: true });
  }

  catch(e) {
    authService.handleError(e, res);
  }
};

//Unfollow User /////////////////////////////////////////////////////

exports.unfollowUser = async (req, res) => {
  try {
    const user = authService.verifyToken(req);
    let foundUser = await User.findById(user._id);
    const updatedUser = foundUser.following.filter(user => user._id.toString() !== req.body.id);
    foundUser.following = updatedUser;
    await foundUser.save();
    res.status(200).json({ success: true });
  }

  catch(e) {
    console.log(e);
    authService.handleError(e, res);
  }
};

//Get My Profile ///////////////////////////////////////////////////////

exports.myProfile = async (req, res) => {
  try {
    const user = authService.verifyToken(req);
    const myProfile = await User.findById(user._id, ['_id,', 'firstName', 'lastName', 'photo']);
    res.status(200).json(myProfile);
  }

  catch(e) {
    authService.handleError(e, res);
  }
};

//Get User Profile /////////////////////////////////////////////////////

exports.getProfile = async (req, res) => {
  try {
    const user = authService.verifyToken(req);
    const userProfile = await User.findById(req.params.id, ['_id', 'firstName', 'lastName', 'photo']);
    const userTodos = await Todo.find({ user: req.params.id })
      .where('finished').equals(false)
      .exec();
    
    res.status(200).json({ user: userProfile, todos: userTodos });
  }

  catch(e) {
    authService.handleError(e, res);
  }
}

//Search Users By Name /////////////////////////////////////////////////

exports.searchUser = async (req, res) => {
  try {
    const user = authService.verifyToken(req);
    const users = await User.find({ fullName : { '$regex' : req.params.name, '$options' : 'i' } }, ['_id', 'firstName', 'lastName', 'photo'])
    .limit(20)
    .exec();
    res.status(200).json(users);
  }

  catch(e) {
    authService.handleError(e, res);
  }
};




//MAYBE ADD THIS LATER//////////////////////////////////////////////////////////////////////

//Get User Todo History /////////////////////////////////////////////////

exports.getUserTodoHistory = async (req, res) => {
  try {
    const user = authService.verifyToken(req);
    const history = await Todo.find({ user: req.params.id })
      .where('finisehd').equals(true)
      .sort({ date: 'desc' })
      .limit(20)
      .exec();
    
    res.status(200).json({ todos: history });
  }

  catch(e) {
    authService.handleError(e, res);
  }  
}

//Get User Todo List /////////////////////////////////////////////////////

exports.getUserTodoList = async (req, res) => {
  try {
    const user = authService.verifyToken(req);
    const history = await Todo.find({ user: req.params.id })
      .where('finisehd').equals(false)
      .sort({ date: 'desc' })
      .limit(20)
      .exec();
    
    res.status(200).json({ todos: history });
  }

  catch(e) {
    authService.handleError(e, res);
  }  
}