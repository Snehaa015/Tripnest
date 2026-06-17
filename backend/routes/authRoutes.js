const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../validators/authValidator');

// @route   POST /api/auth/register
// @desc    Register user & get token
router.post('/register', validateRegister, register);

// @route   POST /api/auth/login
// @desc    Login user & get token
router.post('/login', validateLogin, login);

module.exports = router;
