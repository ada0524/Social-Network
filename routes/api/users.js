// 负责用户注册, create an endpoints to ergister user, 在这一步之前需要在mongodb数据库中创建user

// 调用express
const express = require('express');
// 创建router
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
// 检验传入的数据是否有效
const { check, validationResult } = require('express-validator');
const normalize = require('normalize-url');

const User = require('../../models/User');

// @route    POST api/users
// @description     Register user
// @access   Public
// 监听客户端post请求
router.post(
  '/',
  check('name', 'Name is required').notEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check(
    'password',
    'Please enter a password with 6 or more characters'
  ).isLength({ min: 6 }),
  // 使用 async +  try/catch 结构
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // req.body是传进来的数据，要让这行代码成功传入数据，就需要initialize middleware
    const { name, email, password } = req.body;

    // see if user exists
    try {
      // async需要写 await
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      //get users gravatar
      const avatar = normalize(
        gravatar.url(email, {
          // size, reading, default
          s: '200',
          r: 'pg',
          d: 'mm'
        }),
        { forceHttps: true }
      );

      // create instance of user
      user = new User({
        name,
        email,
        avatar,
        password
      });

      //encrypt the password, 用bcrypt hash this password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // 保存至数据库
      await user.save();

      // return jsonwebtoken，
      // JWT 用于授权而非身份验证。通过身份验证，我们验证用户名和密码是否有效，并将用户登录到系统中。
      // 通过授权，我们可以验证发送到服务器的请求是否属于通过身份验证登录的用户，从而可以授予该用户访问系统的权限，继而批准该用户使用获得的 token 访问路由、服务和资源
      // payload就是希望传输的数据，这样就能识别是哪个user来匹配route
      const payload = {
        user: {
          id: user.id
        }
      };

      // 得到jwt的下一步是to send that token back to authenticate and access protected routes,
      // 所以需要create middleware
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: '5 days' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
