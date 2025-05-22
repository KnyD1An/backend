const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); // Thêm CORS
const UserRoute = require("./routers/user.router");
const ToDoRoute = require('./routers/todo.router');
const app = express();

// Middleware để xử lý CORS
app.use(cors());

// Middleware xử lý dữ liệu JSON
app.use(bodyParser.json());

// Debug middleware - giúp kiểm tra request
app.use((req, res, next) => {
  console.log(`Nhận request: ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Middleware xác thực cho các route khác
const authMiddleware = (req, res, next) => {
  // Kiểm tra các route không cần xác thực
  const nonAuthPaths = ['/login', '/registration'];
  if (nonAuthPaths.includes(req.path)) {
    return next();
  }
  
  // Lấy token từ header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: false, message: 'Access denied, no token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Xác thực token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, 'secret'); // Sử dụng cùng secret key với file auth.middleware.js
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ status: false, message: 'Invalid token' });
  }
};

// Đăng ký routes login và registration mà không cần xác thực
app.use("/login", UserRoute);
app.use("/registration", UserRoute);

// Áp dụng middleware xác thực cho các route khác
app.use("/", authMiddleware);

// Đăng ký routes còn lại
app.use("/", UserRoute);
app.use("/", ToDoRoute);

module.exports = app;