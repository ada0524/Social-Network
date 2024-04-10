// 此文件链接mongodb
const mongoose = require('mongoose');
// 导入config 来直接用 default.json中的string
const config = require('config');
const db = config.get('mongoURI');

// 用async的方式连接数据库
const connectDB = async () => {
  // 如果不能connect，就可以用try catch来抛出错误，用asnyc way连接的时候推荐用try catch
  try {
    // 连接mongodb的语法
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    });

    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
