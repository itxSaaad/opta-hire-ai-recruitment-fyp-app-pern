const { Router } = require('express');
const rateLimiter = require('express-rate-limit');

const { protect } = require('../middlewares/auth.middleware');

const {
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
  forgotPassword,
  resetPassword,
  regenerateOTP,
} = require('../controllers/auth.controllers');

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

router.route('/login').post(limiter, loginUser);

router.route('/logout').post(protect, logoutUser);

router.route('/refresh-token').post(limiter, refreshToken);

router.route('/register').post(registerUser);

router.route('/forgot-password').post(limiter, forgotPassword);

router.route('/reset-password').patch(limiter, resetPassword);

router.route('/regenerate-otp').post(limiter, regenerateOTP);

module.exports = router;

/**
 * @swagger
 *
 * tags:
 *   name: Authorization
 *   description: User authorization operations
 *
 * /api/v1/auth/login:
 *   post:
 *     summary: Logs in a user.
 *     tags: [Authorization]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logged in successfully.
 *                 user:
 *                   type: object
 *                   properties:
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     email:
 *                       type: string
 *                       example: john.doe@example.com
 *                     phone:
 *                       type: string
 *                       example: +921234567890
 *                     isVerified:
 *                       type: boolean
 *                       example: true
 *                     isLinkedinVerified:
 *                       type: boolean
 *                       example: false
 *                     isAdmin:
 *                       type: boolean
 *                       example: false
 *                     isRecruiter:
 *                       type: boolean
 *                       example: false
 *                     isInterviewer:
 *                       type: boolean
 *                       example: false
 *                     isCandidate:
 *                       type: boolean
 *                       example: true
 *                     isTopRated:
 *                       type: boolean
 *                       example: false
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 timestamp:
 *                   type: string
 *                   example: 2023-10-01T12:34:56.789Z
 *       400:
 *         description: Invalid credentials
 *       429:
 *         description: Too many requests
 *
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logs out a user.
 *     tags: [Authorization]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logged out successfully.
 *                 timestamp:
 *                   type: string
 *                   example: 2023-10-01T12:34:56.789Z
 *       400:
 *         description: No refresh token found.
 *
 * /api/v1/auth/refresh-token:
 *   post:
 *     summary: Refreshes the access token.
 *     tags: [Authorization]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Token refreshed successfully.
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 timestamp:
 *                   type: string
 *                   example: 2023-10-01T12:34:56.789Z
 *       400:
 *         description: No refresh token found.
 *       401:
 *         description: Invalid refresh token.
 *       404:
 *         description: User not found.
 *
 * /api/v1/auth/register:
 *   post:
 *     summary: Registers a new user.
 *     tags: [Authorization]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               phone:
 *                 type: string
 *                 example: +921234567890
 *               password:
 *                 type: string
 *                 example: Password123!
 *               role:
 *                 type: string
 *                 example: candidate
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Registration successful.
 *                 user:
 *                   type: object
 *                   properties:
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     email:
 *                       type: string
 *                       example: john.doe@example.com
 *                     phone:
 *                       type: string
 *                       example: +921234567890
 *                     isVerified:
 *                       type: boolean
 *                       example: false
 *                     isLinkedinVerified:
 *                       type: boolean
 *                       example: false
 *                     isAdmin:
 *                       type: boolean
 *                       example: false
 *                     isRecruiter:
 *                       type: boolean
 *                       example: false
 *                     isInterviewer:
 *                       type: boolean
 *                       example: false
 *                     isCandidate:
 *                       type: boolean
 *                       example: true
 *                     isTopRated:
 *                       type: boolean
 *                       example: false
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 timestamp:
 *                   type: string
 *                   example: 2023-10-01T12:34:56.789Z
 *       400:
 *         description: Bad request
 *       409:
 *         description: User already exists
 *       500:
 *         description: Internal server error
 *
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Sends an OTP to the user's email to reset the password.
 *     tags: [Authorization]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: OTP sent successfully.
 *                 timestamp:
 *                   type: string
 *                   example: 2023-10-01T12:34:56.789Z
 *       400:
 *         description: Email is required or invalid email format
 *       404:
 *         description: User not found
 *       500:
 *         description: Email could not be sent
 *
 * /api/v1/auth/reset-password:
 *   patch:
 *     summary: Resets the user's password using OTP.
 *     tags: [Authorization]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               otp:
 *                 type: string
 *                 example: 123456
 *               password:
 *                 type: string
 *                 example: NewPassword123!
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Password reset successfully.
 *                 timestamp:
 *                   type: string
 *                   example: 2023-10-01T12:34:56.789Z
 *       400:
 *         description: Email, OTP, and password are required or invalid email format or OTP has expired or new password cannot be the same as the old password
 *       401:
 *         description: Invalid OTP
 *       404:
 *         description: User not found
 *       500:
 *         description: Email could not be sent
 *
 * /api/v1/auth/regenerate-otp:
 *   post:
 *     summary: Regenerates a new OTP for the user.
 *     tags: [Authorization]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *     responses:
 *       200:
 *         description: OTP regenerated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: OTP regenerated successfully.
 *                 timestamp:
 *                   type: string
 *                   example: 2023-10-01T12:34:56.789Z
 *       400:
 *         description: Email is required or invalid email format
 *       404:
 *         description: User not found
 *       500:
 *         description: Email could not be sent
 */
