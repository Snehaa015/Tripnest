const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const userData = await authService.registerUser(name, email, password);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: userData
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userData = await authService.loginUser(email, password);
    res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      data: userData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login
};
