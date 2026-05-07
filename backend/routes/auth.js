const express = require('express');
const router = express.Router();
const { signup, login, getMe, getAllUsers } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/users', protect, getAllUsers);

module.exports = router;
