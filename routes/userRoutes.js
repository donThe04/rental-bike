const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const rfid = require('../controllers/rfidController');

// Đăng ký người dùng
router.post('/register', userController.registerUser);

// Đăng nhập người dùng
router.post('/login', userController.loginUser);

// Route hiển thị người dùng hiện tại
router.get('/me', userController.authenticateUser, userController.getCurrentUser);

//xác thực người dùng qua RFID
router.post('/rfid', rfid.authenticateUserByRFID);

module.exports = router;
