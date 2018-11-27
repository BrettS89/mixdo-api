const express = require('express');
const router = express.Router();
const todos = require('../controllers/todos');

router.get('/public', todos.publicTodos);

router.post('/add', todos.addTodo);

router.post('/finish', todos.finishTodo);

router.post('/like', todos.likeTodo);

router.post('/addusertodo', todos.addUserTodo);

router.post('/finish', todos.finishTodo);

router.post('/delete', todos.deleteTodo);

router.get('/get', todos.getTodos);

router.post('/infinity', todos.infinity);

router.get('/user', todos.getMyTodos);

router.get('/userhistory', todos.getMyTodoHistory);

router.get('/discover', todos.discover);

router.post('/infinitidiscover', todos.infinityDiscover);

router.get('/search/:data', todos.search);

router.post('/addcomment', todos.addComment);

router.get('/getcomments/:id', todos.getComments);

router.post('/infinitycomments', todos.infinityComments);

router.post('/flag', todos.flag);

module.exports = router;
