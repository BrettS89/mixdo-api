const express = require('express');
const router = express.Router();
const todos = require('../controllers/todos');

router.post('/add', todos.addTodo);

router.post('/finish', todos.finishTodo);

router.post('/like', todos.likeTodo);

router.post('/addusertodo', todos.addUserTodo);

router.post('/finish', todos.finishTodo);

router.delete('/delete', todos.deleteTodo);

router.get('/get', todos.getTodos);

router.post('/infinity', todos.infinity);

router.get('/user', todos.getMyTodos);

router.get('/discover', todos.discover);

router.post('/infinitidiscover', todos.infinityDiscover);

router.get('/search/:data', todos.search);

module.exports = router;
