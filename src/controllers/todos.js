const authService = require('../services/auth');
const todoService = require('../services/todos');
const Todo = require('../models/todo');
const User = require('../models/user');
const Notification = require('../models/notification');
const notificationTypes = require('../config/index');

const mixpanel = require('../services/mixpanel');
const notifications = require('../services/pushNotifications');


// Add a todo /////////////////////////////////////////////////

exports.addTodo = async (req, res) => {
  try {
  const user = authService.verifyToken(req);

  if(!req.body.description) {
    throw { error: 'Must provide a description', status: 406 }
  }

  const todo = new Todo({
    createdDate: new Date(Date.now()),
    description: req.body.description,
    metaData: req.body.metaData,
    toSearch: `${req.body.description} ${req.body.metaData}`,
    date: Number(Date.now()),
    user: user._id
  });
  
    const savedTodo = await todo.save();

    const preppedTodo = {
      _id: savedTodo._id,
      createdDate: savedTodo._createdDate,
      date: savedTodo.date,
      user: savedTodo.user,
      description: savedTodo.description,
      metaData: savedTodo.metaData,
      finished: savedTodo.finished,
      likes: savedTodo.likes,
      comments: savedTodo.comments,
      added: savedTodo.added,
      list: true
    };

    res.status(200).json(preppedTodo);

    mixpanel.track('added todo', user._id);
  }

  catch(e) {
    authService.handleError(e, res);
  }
};

// Finish a todo ///////////////////////////////////////////////

exports.finishTodo = async (req, res) => {
  try {
    const user = await authService.verifyToken(req);
    await Todo.findByIdAndUpdate(req.body.id, { finished: true, image: req.body.image, date: Date.now(), createdDate: new Date() });
    res.status(200).json({ finished: true });

    mixpanel.track('finished todo', user._id);
  }

  catch(e) {
    console.log(e);
    authService.handleError(e, res);
  }
};


// Like a todo /////////////////////////////////////////////////

exports.likeTodo = async (req, res) => {
  try {
    const user = authService.verifyToken(req);
    const likedTodo = await Todo.findById(req.body.todo);
    if(likedTodo.likes.indexOf(user._id) > -1) {
      throw new Error('user already like this todo');
    }
    likedTodo.likes.push(user._id);
    await likedTodo.save();

    const notification = new Notification({
      date: Date.now(),
      type: notificationTypes.TODO_LIKED,
      message: `${user.fullName} liked your todo: ${likedTodo.description}`,
      from: user._id,
      for: likedTodo.user
    });

    await notification.save();

    res.status(200).json({ liked: req.body.todo });

    const foundUser = await User.findById(likedTodo.user);

    if(foundUser.pushToken) {
      await notifications.send(foundUser.pushToken, `${user.fullName} liked your todo`);
    }

    mixpanel.track('todo liked', user._id);
  }

  catch(e) {
    authService.handleError(e, res);
  }
};

// Add a users's todo ///////////////////////////////////////////

exports.addUserTodo = async (req, res) => {
  try {
    const user = authService.verifyToken(req);
    const newTodo = new Todo({
      description: req.body.description,
      metaData: req.body.metaData,
      createdDate: new Date(Date.now()),
      date: Date.now(),
      user: user._id
    });
    await newTodo.save();
    const addedTodo = await Todo.findById(req.body._id);
    addedTodo.added.push(user._id);
    await addedTodo.save();

    const notification = new Notification({
      date: Date.now(),
      type: notificationTypes.TODO_ADDED,
      message: `${user.fullName} added your todo: ${addedTodo.description}`,
      from: user._id,
      for: addedTodo.user
    });

    await notification.save();

    res.status(200).json({ success: true });

    const foundUser = await User.findById(addedTodo.user);

    if(foundUser.pushToken) {
      await notifications.send(foundUser.pushToken, `${user.fullName} added your todo`);
    }
  }

  catch(e) {
    authService.handleError(e, res);
  }
}

// Get todos ////////////////////////////////////////////////////

exports.getTodos = async (req, res) => {
  try {
    const user = authService.verifyToken(req);
    const friends = await User.findById(user._id, 'following');
    const friendsAndUser = [...friends.following, user._id];
    const todos = await Todo.find({ 'user': { $in: friendsAndUser }})
      // .where('finished').equals(false)
      .sort({ date: 'desc' })
      .limit(20)
      .populate('user', ['_id', 'firstName', 'lastName', 'photo'])
      .lean()
      .exec(); 

    const preppedTodos = todoService.getPreppedTodos(user._id, todos);
    res.status(200).json(preppedTodos);  
  }

  catch(e) {
    console.log(e);
    authService.handleError(e, res);
  }
};

// INFINITY SCROLL ////////////////////////////////////////////////

exports.infinity = async (req, res) => {
  try {
    const user = authService.verifyToken(req);
    const friends = await User.findById(user._id, 'following');
    const friendsAndUser = [...friends.following, user._id];
    const todos = await Todo.find({ 'user': { $in: friendsAndUser }})
      .where('date').lt(req.body.date)
      .sort({ date: 'desc' })
      .limit(10)
      .populate('user', ['_id', 'firstName', 'lastName', 'photo'])
      .exec();
    const preppedTodos = todoService.getPreppedTodos(user._id, todos);
    res.status(200).json(preppedTodos);

    mixpanel.track('feed deep', user._id);
  }

  catch(e) {
    authService.handleError(e, res);
  }
};

// Discover todos ////////////////////////////////////////////////

exports.discover = async (req, res) => {
  try {
    const user = authService.verifyToken(req);
    const { following } = await User.findById(user._id, 'following');
    const todos = await Todo.find()
      .sort({ date: 'desc' })
      .limit(20)
      .populate('user', ['_id', 'firstName', 'lastName', 'photo'])
      .lean()
      .exec();
    
    const preppedTodos = todoService.getPreppedTodos(user._id, todos, following, user._id, true);
    res.status(200).json(preppedTodos);  
  }

  catch(e) {
    authService.handleErrors(e, res);
  }
};

// INFINITY SCROLL DISCOVER ////////////////////////////////////////////////

exports.infinityDiscover = async (req, res) => {
  try {
    const user = authService.verifyToken(req);
    const { following } = await User.findById(user._id, 'following');
    const todos = await Todo.find()
      .where('date').lt(req.body.date)
      .sort({ date: 'desc' })
      .limit(10)
      .populate('user', ['_id', 'firstName', 'lastName', 'photo'])
      .lean()
      .exec();

    const preppedTodos = todoService.getPreppedTodos(user._id, todos, following, user._id, true);
    res.status(200).json(preppedTodos);

    mixpanel.track('discover deep', user._id);
  }

  catch(e) {
    authService.handleError(e, res);
  }
};

// Get my todos /////////////////////////////////////////

exports.getMyTodos = async (req, res) => {
  try {
    const user = authService.verifyToken(req);
    const todos = await Todo.find({ user: user._id })
      .where('finished').equals(false)
      // .sort({ date: 'desc' })
      .lean()
      .exec(); 

    const preppedTodos = todos.map(todo => {
      return {
        _id: todo._id,
        createdDate: todo._createdDate,
        date: todo.date,
        user: todo.user,
        description: todo.description,
        metaData: todo.metaData,
        finished: todo.finished,
        likes: todo.likes,
        comments: todo.comments,
        added: todo.added,
        list: true
      };
    });  

    res.status(200).json(preppedTodos);  
  }

  catch(e) {
    authService.handleError(e, res);
  }
};

// Get my todo history /////////////////////////////////

exports.getMyTodoHistory = async (req, res) => {
  try {
    const user = authService.verifyToken(req);
    const todos = await Todo.find({ user: user._id })
      .where('finished').equals(true)
      .sort({ date: 'desc' })
      .lean()
      .exec(); 

    // const preppedTodos = todos.map(todo => {
    //   return {
    //     _id: todo._id,
    //     createdDate: todo._createdDate,
    //     date: todo.date,
    //     user: todo.user,
    //     description: todo.description,
    //     metaData: todo.metaData,
    //     finished: todo.finished,
    //     likes: todo.likes,
    //     comments: todo.comments,
    //     added: todo.added,
    //     list: true
    //   };
    // });  

    res.status(200).json(todos);  
  }

  catch(e) {
    authService.handleError(e, res);
  }
};


// Delete Item  ///////////////////////////////////////////////////

exports.deleteTodo = async (req, res) => {
  console.log(req.body);
  try {
    authService.verifyToken(req);
    await Todo.findByIdAndDelete(req.body.id);
    res.status(200).json({ deleted: true });
  }

  catch(e) {
    authService.handleError(e, res);
  }
};

//Search by Hashtags //////////////////////////////////////////////

exports.search = async (req, res) => {
  try {
    const user = authService.verifyToken(req);
    const todos = await Todo.find({ toSearch : { '$regex' : req.params.data, '$options' : 'i' } })
    .sort({ date: 'desc' })
    .limit(20)
    .populate('user', ['_id', 'firstName', 'lastName', 'photo'])
    .lean()
    .exec();
    res.status(200).json(todos);

    mixpanel.track('todo search', user._id);
  }

  catch(e) {
    authService.handleError(e, res);
  }
};
