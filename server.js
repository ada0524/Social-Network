// 1.创建package.json，build express server 和 api
// 2.install dependency, bcryptjs用于密码验证，config用于全局变量，gravatar用于profile avatar
// install dev dependency,
// server.js是main entry 

//首先搭建express
const express = require('express');
//调用config中的connect mongobd
const connectDB = require('./config/db');
const path = require('path');

const app = express();

// Connect Database
connectDB();

// Init Middleware
// 要让req.body传入数据，就需要initialize middleware
app.use(express.json());

// Define Routes
// 确保可以access这些routes， make '/api/users' here pertain to routes文件夹中users.js router.get中的‘/’。
// 如果post to api/users就会新建一个user
// 导入路由模块（require...） + 注册路由模块，app.use()函数的作用，就是来注册全局中间件
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
