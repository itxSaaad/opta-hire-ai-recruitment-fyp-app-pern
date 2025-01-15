const { Router } = require('express');
const rateLimiter = require('express-rate-limit');

const {
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
  forgotPassword,
  resetPassword,
  regenerateOTP,
} = require('../controllers/auth.controllers');

/**
 * @swagger
 *
 * tags:
 *   name: Authorization
 *   description: User authorization operations
 */

const router = Router();

const limiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many requests from this IP, please try again later.',
  handler: (req, res, next, options) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
    });
  },
  standardHeaders: true,
  legacyHeaders: true,
});

router.route('/logout').get(logoutUser);

router.route('/login').post(limiter, loginUser);

router.route('/refresh-token').post(refreshToken);

router.route('/register').post(registerUser);

router.route('/forgot-password').post(limiter, forgotPassword);

router.route('/reset-password').post(limiter, resetPassword);

router.route('/regenerate-otp').post(limiter, regenerateOTP);

module.exports = router;
