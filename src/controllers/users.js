const authService = require('../services/auth');
const Todo = require('../models/todo');
const User = require('../models/user');
const Notification = require('../models/notification');
const FOLLOWED = require('../config/index').FOLLOWED;
const notifications = require('../services/pushNotifications');


//Save pushToken
exports.savePushToken = async (req, res) => {
  try {
    const { user, token } = await authService.verifyToken(req);
    let foundUser = await User.findById(user._id);
    foundUser.pushToken = req.body.token;
    await foundUser.save();
    res.status(200).json({ res: { succes: true }, token });
  }

  catch(e) {
    authService.handleError(e, res);
  }
};


//Find Friends ////////////////////////////////////////////////////

exports.find = async (req, res) => {
  try {
    const { user, token } = await authService.verifyToken(req);
    console.log('hi', user);

    const following = await User.findById(user._id, 'following')
      .populate('following', ['_id'])
      .exec();

    const users = await User.find({ _id: { $nin: following.following } }, ['_id', 'firstName', 'lastName', 'fullName', 'photo', 'date'])
      .where('_id').ne(user._id)
      .sort({ date: 'desc' })
      .limit(20)
      .lean()
      .exec();

    res.status(200).json({ res: { users, following }, token });
  }

  catch(e) {
    res.status(200).json({ users: 'no users' });
  }
};

//Find Friends infinite scroll //////////////////////////////////////

exports.findInfinite = async (req, res) => {
  try {
    const { user, token } = await authService.verifyToken(req);

    const following = await User.findById(user._id, 'following')
      .populate('following', ['_id'])
      .lean()
      .exec();

    const users = await User.find({ _id: { $nin: following.following } }, ['_id', 'firstName', 'lastName', 'fullName', 'photo', 'date'])
      .where('date').lt(Number(req.params.date))
      .sort({ date: 'desc' })
      .limit(20)
      .lean()
      .exec();

    const filteredUsers = users.filter(oneUser => {
      return oneUser._id.toString() !== user._id;
    });

    console.log(filteredUsers);

    res.status(200).json({ res: filteredUsers, token });
  }

  catch(e) {
    console.log(e);
    res.status(200).json({ users: 'no users' });
  }
};


//Get Followers /////////////////////////////////////////////////////

exports.getFollowers = async (req, res) => {
  if(req.params.type === 'Followers') {

    try {
      const { user, token } = await authService.verifyToken(req);
      const followers = await User.findById(user._id, 'followers')
        .populate('followers', ['_id', 'firstName', 'lastName', 'fullName', 'photo'])
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
                fullName: follower.fullName ? follower.fullName : '',
                photo: follower.photo ? follower.photo : false,
                following: true
              };
            }
            return follower;
          });
  
        return res.status(200).json({ followers1, token });  
      }  
      catch(e) {
        const followers1 = followers.followers;
        return res.status(200).json({ followers1, token });
      }    
    }
    catch(e) {
      return res.status(200).json({ users: 'no users', token });
    }
  }

  try {
    const { user, token } = await authService.verifyToken(req);
    let following = await User.findById(user._id, 'following')
      .populate('following', ['_id', 'firstName', 'lastName', 'fullName', 'photo'])
      .lean()
      .exec();
      const followers1 = following.following.map(user => {
        return {
          _id: user._id,
          firstName: user.firstName ? user.firstName : '',
          lastName: user.lastName ? user.lastName :'',
          fullName: user.fullName ? user.fullName: '',
          photo: user.photo ? user.photo : false,
          following: true
        };
      });
      res.status(200).json({ followers1, token });
  }

  catch(e) {
    res.status(200).json({ users: 'no users', token });
  }

};

//Follow User ///////////////////////////////////////////////////////

exports.followUser = async (req, res) => {
  try {
    const { user, token } = await authService.verifyToken(req);
    const foundUser = await User.findById(user._id);

    if(foundUser.following.indexOf(req.body.id) !== -1) {
      return res.status(200).json({ res: { status: 'alreadyFollowing' }, token });
    }

    foundUser.following.push(req.body.id);
    const followedUser = await User.findById(req.body.id);
    followedUser.followers.push(foundUser._id);

    const notification = new Notification({
      date: Date.now(),
      type: FOLLOWED,
      message: `${foundUser.fullName} started following you`,
      from: foundUser._id,
      for: req.body.id
    });

    await foundUser.save();
    await followedUser.save();
    await notification.save();

    res.status(200).json({ res: { success: true }, token });

    if(followedUser.pushToken) {
      console.log('in');
      await notifications.send(followedUser.pushToken, `${foundUser.fullName} started following you`);
    }
    
  }

  catch(e) {
    authService.handleError(e, res);
  }
};

//Unfollow User /////////////////////////////////////////////////////

exports.unfollowUser = async (req, res) => {
  try {
    const { user, token } = await authService.verifyToken(req);
    let foundUser = await User.findById(user._id);
    const updatedUser = foundUser.following.filter(user => user._id.toString() !== req.body.id);
    foundUser.following = updatedUser;
    await foundUser.save();

    let unfollowedUser = await User.findById(req.body.id);
    unfollowedUser.followers = unfollowedUser.followers.filter(id => {
      return id.toString() !== user._id;
    });

    await unfollowedUser.save()

    res.status(200).json({ res: { success: true }, token });
  }

  catch(e) {
    console.log(e);
    authService.handleError(e, res);
  }
};

//Get My Profile ///////////////////////////////////////////////////////

exports.myProfile = async (req, res) => {
  try {
    const { user, token } = await authService.verifyToken(req);
    const myProfile = await User.findById(user._id, ['_id,', 'firstName', 'lastName', 'fullName', 'photo']);
    res.status(200).json({ res: myProfile, token });
  }

  catch(e) {
    authService.handleError(e, res);
  }
};

//Upload Profile Photo /////////////////////////////////////////////////

exports.uploadProfilePhoto = async (req, res) => {
  try {
    const { user, token } = await authService.verifyToken(req);
    const foundUser = await User.findById(user._id);
    foundUser.photo = req.body.photo;
    await foundUser.save();
    res.status(200).json(foundUser);
  }
  catch(e) {
    authService.handleError(e, res); 
  }
};

//Get User Profile /////////////////////////////////////////////////////

exports.getProfile = async (req, res) => {
  try {
    const { user, token } = await authService.verifyToken(req);
    const userProfile = await User.findById(req.params.id, ['_id', 'firstName', 'lastName', 'fullName', 'photo']);
    const userTodos = await Todo.find({ user: req.params.id })
      .where('finished').equals(false)
      .exec();
    
    res.status(200).json({ user: userProfile, todos: userTodos, token });
  }

  catch(e) {
    authService.handleError(e, res);
  }
};

//Search Users By Name /////////////////////////////////////////////////

exports.searchUser = async (req, res) => {
  try {
    const { user, token } = await authService.verifyToken(req);
    const users = await User.find({ fullName : { '$regex' : req.params.name, '$options' : 'i' } }, ['_id', 'firstName', 'lastName', 'fullName', 'photo'])
    .limit(20)
    .exec();
    res.status(200).json({ res: users, token });
  }

  catch(e) {
    authService.handleError(e, res);
  }
};


//Delete a user and posts ///////////////////////////////////////////////

exports.deleteUser = async (req, res) => {
  try {
    const { user, token } = await authService.verifyToken(req);
    await Todo.remove({ user: user._id });
    let foundUser = await User.findById(user._id);
    foundUser.fullName = 'Deleted user';
    foundUser.firstName = 'Deleted';
    foundUser.lastName = 'user';
    foundUser.photo = '';
    foundUser.email = `deleted:${user._id}`;
    foundUser.devices = [];
    await foundUser.save();
    
    res.status(200).json({ res: { status: true }, token });
  }

  catch(e) {
    console.log(e);
    authService.handleError(e, res);
  }
}


//MAYBE ADD THIS LATER//////////////////////////////////////////////////////////////////////

//Get User Todo History /////////////////////////////////////////////////

exports.getUserTodoHistory = async (req, res) => {
  try {
    const { user, token } = await authService.verifyToken(req);
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
};

//Get User Todo List /////////////////////////////////////////////////////

exports.getUserTodoList = async (req, res) => {
  try {
    const { user, token } = await authService.verifyToken(req);
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
};
