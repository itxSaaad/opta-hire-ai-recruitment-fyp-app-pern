const asyncHandler = require('express-async-handler');
const emailValidator = require('email-validator');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

const { User } = require('../models');

const { validateString } = require('../utils/validation.utils');
const {
  sendEmail,
  generateEmailTemplate,
} = require('../utils/nodemailer.utils');

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
    throw new Error('Please enter both email and password to sign in.');
  }

  if (!emailValidator.validate(email)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Please enter a valid email address.');
  }

  const user = await User.findOne({
    where: { email },
  });

  if (!user) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error('These credentials do not match our records.');
  }

  const isPasswordCorrect = await user.validatePassword(password);

  if (!isPasswordCorrect) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error('These credentials do not match our records.');
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
    message: 'Welcome back! You have successfully signed in.',
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      isVerified: user.isVerified,
      isLinkedinVerified: user.isLinkedinVerified,
      isAdmin: user.isAdmin,
      isRecruiter: user.isRecruiter,
      isInterviewer: user.isInterviewer,
      isCandidate: user.isCandidate,
      isTopRated: user.isTopRated,
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
    throw new Error('Your session has already expired. Please sign in again.');
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None',
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'You have been successfully signed out.',
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
    throw new Error('Session expired. Please sign in again.');
  }

  jwt.verify(
    cookies.refreshToken,
    process.env.JWT_REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      if (err) {
        res.status(StatusCodes.UNAUTHORIZED);
        throw new Error('Invalid session. Please sign in again.');
      }

      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
      });

      if (!user) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Account not found. Please contact support.');
      }

      const accessToken = user.generateAccessToken();

      res.status(StatusCodes.OK).json({
        success: true,
        message: 'Session refreshed successfully.',
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
    throw new Error(
      'Please fill in all required fields to complete registration.'
    );
  }

  if (!emailValidator.validate(email)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Please enter a valid email address.');
  }

  if (!['admin', 'recruiter', 'interviewer', 'candidate'].includes(role)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Invalid user role selected.');
  }

  const existingUser = await User.findOne({
    where: { email },
    attributes: { exclude: ['password'] },
  });

  if (existingUser) {
    res.status(StatusCodes.CONFLICT);
    throw new Error('An account with this email already exists.');
  }

  const phoneRegex = /^\+(?:[0-9] ?){6,14}[0-9]$/;
  if (!phoneRegex.test(phone)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(
      'Please enter a valid phone number starting with + symbol.'
    );
  }

  let userFlags = {
    isAdmin: role === 'admin',
    isRecruiter: role === 'recruiter',
    isInterviewer: role === 'interviewer',
    isCandidate: role === 'candidate',
  };

  const validatedData = {
    firstName: firstName
      ? validateString(firstName, 'First Name', 2, 50)
      : null,
    lastName: lastName ? validateString(lastName, 'Last Name', 2, 50) : null,
    email: email ? validateString(email, 'Email', 5, 255) : null,
    phone: phone ? validateString(phone, 'Phone', 10, 15) : null,
    password: password ? validateString(password, 'Password', 6, 100) : null,
  };

  const user = await User.create({
    ...validatedData,
    isVerified: false,
    isLinkedinVerified: false,
    ...userFlags,
  });

  if (!user) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Unable to create your account. Please try again.');
  }

  const verficationOTP = await user.generateOTP();
  const otpExpiresIn = new Date();
  otpExpiresIn.setMinutes(otpExpiresIn.getMinutes() + 10);

  user.otp = verficationOTP;
  user.otpExpires = otpExpiresIn;

  await user.save();

  const isEmailSent = await sendEmail({
    from: process.env.NODEMAILER_SMTP_EMAIL,
    to: user.email,
    subject: 'Welcome to OptaHire - Verify Your Email',
    html: generateEmailTemplate({
      firstName: user.firstName,
      subject: 'Welcome to OptaHire - Verify Your Email',
      content: [
        {
          type: 'text',
          value:
            "Welcome to OptaHire! We're excited to have you join us. Please verify your email with this code:",
        },
        {
          type: 'otp',
          value: verficationOTP,
        },
        {
          type: 'text',
          value: 'This code will expire in 10 minutes.',
        },
        {
          type: 'text',
          value: "Didn't create an account? Please ignore this email.",
        },
      ],
    }),
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Account created but verification email could not be delivered.'
    );
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
    message: 'Account created successfully. Please check your email to verify.',
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      isVerified: user.isVerified,
      isLinkedinVerified: user.isLinkedinVerified,
      isAdmin: user.isAdmin,
      isRecruiter: user.isRecruiter,
      isInterviewer: user.isInterviewer,
      isCandidate: user.isCandidate,
      isTopRated: user.isTopRated,
    },
    accessToken,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Send OTP to user's email for password reset.
 *
 * @route POST /api/v1/auth/forgot-password
 * @access Private
 *
 * @param {Object} req - The request object containing email.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the email is missing or invalid.
 */

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Please enter your email address to reset your password.');
  }

  if (!emailValidator.validate(email)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Please enter a valid email address.');
  }

  const user = await User.findOne({
    where: { email },
    attributes: {
      exclude: ['password'],
    },
  });

  if (!user) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('No account found with this email address.');
  }

  const resetPasswordOTP = await user.generateOTP();

  const otpExpiresIn = new Date();
  otpExpiresIn.setMinutes(otpExpiresIn.getMinutes() + 10);

  user.otp = resetPasswordOTP;
  user.otpExpires = otpExpiresIn;

  const updatedUser = await user.save();

  if (!updatedUser) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Unable to process your request. Please try again.');
  }

  const isEmailSent = await sendEmail({
    from: process.env.NODEMAILER_SMTP_EMAIL,
    to: user.email,
    subject: 'OptaHire - Reset Your Password',
    html: generateEmailTemplate({
      firstName: user.firstName,
      subject: 'OptaHire - Reset Your Password',
      content: [
        {
          type: 'text',
          value:
            'You recently requested to reset your password for your OptaHire account. Use the OTP below to reset it:',
        },
        {
          type: 'otp',
          value: resetPasswordOTP,
        },
        {
          type: 'text',
          value: 'This OTP will expire in 10 minutes for security purposes.',
        },
        {
          type: 'text',
          value:
            "If you didn't request a password reset, please ignore this email.",
        },
      ],
    }),
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'OTP Generated but notification emails could not be delivered.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Password reset OTP sent to your email.',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Reset user's password.
 *
 * @route PATCH /api/v1/auth/reset-password
 * @access Private
 *
 * @param {Object} req - The request object containing email, OTP, and new password.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the email, OTP, or password is missing, or if the email is invalid, or if the OTP is invalid.
 */

const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;

  const currentTime = new Date();

  if (!email || !otp || !password) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(
      'Please provide your email, verification code, and new password.'
    );
  }

  if (!emailValidator.validate(email)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Please enter a valid email address.');
  }

  const user = await User.findOne({
    where: { email },
  });

  if (!user) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('No account found with this email address.');
  }

  if (currentTime > user.optExpires) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Verification code has expired. Please request a new one.');
  }

  if (user.otp !== otp) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error('Invalid verification code. Please try again.');
  }

  if (user.password === password) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(
      'New password must be different from your current password.'
    );
  }

  user.password = password;
  user.otp = null;
  user.optExpires = null;

  await user.save();

  const isEmailSent = await sendEmail({
    from: process.env.NODEMAILER_SMTP_EMAIL,
    to: user.email,
    subject: 'OptaHire - Password Reset Successful',
    html: generateEmailTemplate({
      firstName: user.firstName,
      subject: 'OptaHire - Password Reset Successful',
      content: [
        {
          type: 'text',
          value: 'Your password has been successfully reset.',
        },
        {
          type: 'text',
          value:
            'If you did not make this change, please contact support immediately.',
        },
        {
          type: 'text',
          value:
            'For enhanced security, we recommend using strong, unique passwords.',
        },
      ],
    }),
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Password reset successful but notification emails could not be delivered.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Your password has been reset successfully.',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Regenerate OTP for user.
 *
 * @route POST /api/v1/auth/regenerate-otp
 * @access Private
 *
 * @param {Object} req - The request object containing email.
 * @param {Object} res - The response object.
 *
 * @returns {Promise<void>}
 * @throws {Error} If the email is missing or invalid.
 */

const regenerateOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Please provide your email address.');
  }

  if (!emailValidator.validate(email)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Please enter a valid email address.');
  }

  const user = await User.findOne({
    where: { email },
    attributes: {
      exclude: ['password'],
    },
  });

  if (!user) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('No account found with this email address.');
  }

  const verficationOTP = await user.generateOTP();

  const otpExpiresIn = new Date();
  otpExpiresIn.setMinutes(otpExpiresIn.getMinutes() + 10);

  user.otp = verficationOTP;
  user.otpExpires = otpExpiresIn;

  const updatedUser = await user.save();

  if (!updatedUser) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Unable to update user. Please try again.');
  }

  const isEmailSent = await sendEmail({
    from: process.env.NODEMAILER_SMTP_EMAIL,
    to: user.email,
    subject: 'OptaHire - Your New Verification Code',
    html: generateEmailTemplate({
      firstName: user.firstName,
      subject: 'OptaHire - Your New Verification Code',
      content: [
        {
          type: 'text',
          value: "You requested a new verification code. Here's your new OTP:",
        },
        {
          type: 'otp',
          value: verficationOTP,
        },
        {
          type: 'text',
          value: 'This code will expire in 10 minutes.',
        },
        {
          type: 'text',
          value: "If you didn't request this code, please ignore this email.",
        },
      ],
    }),
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'OTP Generated but notification emails could not be delivered.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'New verification code sent to your email.',
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
  forgotPassword,
  resetPassword,
  regenerateOTP,
};
