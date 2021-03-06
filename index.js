const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const appRoutes = require('./src/routes/app');
const authRoutes = require('./src/routes/auth');
const todoRoutes = require('./src/routes/todos');
const userRoutes = require('./src/routes/users');
const notificationRoutes = require('./src/routes/notifications');
const uploadRoutes = require('./src/routes/upload');
const cors = require('cors');
const keys = require('./src/config');

//DB Setup
mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, { useNewUrlParser: true });

//App Setup
const app = express();
app.use (morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cors());
app.use('/upload', uploadRoutes);
app.use('/notifications', notificationRoutes);
app.use('/users', userRoutes)
app.use('/todos', todoRoutes);
app.use('/auth', authRoutes);
app.use('/', appRoutes);

//Server Setup
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`server started on port ${port}`);
});
