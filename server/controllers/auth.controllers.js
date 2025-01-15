const asyncHandler = require('express-async-handler');
const emailValidator = require('email-validator');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

const { User } = require('../models');

const sendEmail = require('../utils/nodemailer.utils');

/**
 * @desc Logs in a user.
 *
 * @route POST /api/v1/auth/login
 * @access Public
 *
 * @param {Object} req - The request object containing email and password.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the email or password is missing, or if the email is invalid, or if the credentials are invalid.
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Email and password are required.');
  }

  if (!emailValidator.validate(email)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Invalid email format.');
  }

  const user = await User.findOne({
    where: { email },
  });

  if (!user) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error('Invalid email or password.');
  }

  const isPasswordCorrect = await user.validatePassword(password);

  if (!isPasswordCorrect) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error('Invalid email or password.');
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Logged in successfully.',
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    accessToken,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Logs out a user.
 *
 * @route POST /api/v1/auth/logout
 * @access Private
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */

const logoutUser = asyncHandler(async (req, res) => {
  const cookies = req.cookies;

  if (!cookies.refreshToken) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('No refresh token found.');
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None',
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Logged out successfully.',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Refreshes the user token.
 *
 * @route POST /api/v1/auth/refresh-token
 * @access Private
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the refresh token is missing or invalid.
 */

const refreshToken = asyncHandler(async (req, res) => {
  const cookies = req.cookies;

  if (!cookies.refreshToken) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('No refresh token found.');
  }

  jwt.verify(
    cookies.refreshToken,
    process.env.JWT_REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      if (err) {
        res.status(StatusCodes.UNAUTHORIZED);
        throw new Error('Invalid refresh token.');
      }

      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
      });

      if (!user) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('User not found.');
      }

      const accessToken = user.generateAccessToken();

      res.status(StatusCodes.OK).json({
        success: true,
        message: 'Token refreshed successfully.',
        accessToken,
        timestamp: new Date().toISOString(),
      });
    })
  );
});

/**
 * @desc Registers a new user.
 *
 * @route POST /api/v1/auth/register
 * @access Public
 *
 * @param {Object} req - The request object containing user details.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the registration fails.
 */
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, password, role } = req.body;

  if (!firstName || !lastName || !email || !phone || !password || !role) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('All fields are required.');
  }

  if (!emailValidator.validate(email)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Invalid email format.');
  }

  if (!['admin', 'recruiter', 'interviewer', 'candidate'].includes(role)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Invalid role.');
  }

  const existingUser = await User.findOne({
    where: { email },
    attributes: {
      exclude: ['password'],
    },
  });

  if (existingUser) {
    res.status(StatusCodes.CONFLICT);
    throw new Error('User already exists.');
  }

  const verficationOTP = user.generateOTP();

  const isEmailSent = await sendEmail({
    from: process.env.SMTP_EMAIL,
    to: user.email,
    subject: 'Account Verification',
    html: `<h1>Your OTP is ${verficationOTP}</h1>`,
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Email could not be sent.');
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    role,
  });

  if (!user) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Registration failed.');
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Registration successful.',
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    accessToken,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Resets the user password.
 *
 * @route POST /api/v1/auth/reset-password
 * @access Private
 *
 * @param {Object} req - The request object containing email, old password, new password, and confirm new password.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the email, old password, new password, or confirm new password is missing, or if the email is invalid, or if the old password is incorrect, or if the new passwords do not match.
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { email, oldPassword, newPassword, confirmNewPassword } = req.body;

  if (!email || !oldPassword || !newPassword || !confirmNewPassword) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('All fields are required.');
  }

  if (!emailValidator.validate(email)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Invalid email format.');
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('User not found.');
  }

  const isOldPasswordCorrect = await user.validatePassword(oldPassword);

  if (!isOldPasswordCorrect) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error('Old password is incorrect.');
  }

  if (newPassword !== confirmNewPassword) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('New passwords do not match.');
  }

  user.password = newPassword;
  await user.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Password reset successfully.',
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
  resetPassword,
};
