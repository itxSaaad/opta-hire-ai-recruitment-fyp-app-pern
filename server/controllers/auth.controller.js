const asyncHandler = require('express-async-handler');
const emailValidator = require('email-validator');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

const { User } = require('../models');

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

  let userFlags = {
    isAdmin: false,
    isRecruiter: false,
    isInterviewer: false,
    isCandidate: false,
  };

  switch (role) {
    case 'admin':
      userFlags.isAdmin = true;
      break;
    case 'recruiter':
      userFlags.isRecruiter = true;
      break;
    case 'interviewer':
      userFlags.isInterviewer = true;
      break;
    case 'candidate':
      userFlags.isCandidate = true;
      break;
    default:
      break;
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    isVerified: false,
    isLinkedinVerified: false,
    ...userFlags,
  });

  if (!user) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Registration failed.');
  }

  const verficationOTP = await user.generateOTP();
  const otpExpiresIn = new Date();
  otpExpiresIn.setMinutes(otpExpiresIn.getMinutes() + 10);

  user.otp = verficationOTP;
  user.otpExpires = otpExpiresIn;

  await user.save();

  const isEmailSent = await sendEmail({
    from: process.env.SMTP_EMAIL,
    to: user.email,
    subject: 'Welcome to OptaHire - Verify Your Email',
    html: generateEmailTemplate({
      firstName: user.firstName,
      subject: 'Welcome to OptaHire - Verify Your Email',
      content: [
        {
          type: 'text',
          value:
            "Welcome to OptaHire! We're excited to have you on board. To get started, please verify your email address using the OTP below:",
        },
        {
          type: 'otp',
          value: verficationOTP,
        },
        {
          type: 'text',
          value:
            'This verification code will expire in 10 minutes for security purposes.',
        },
        {
          type: 'text',
          value:
            "If you didn't create an account with OptaHire, please disregard this email.",
        },
      ],
    }),
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Email could not be sent.');
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
    throw new Error('Email is required.');
  }

  if (!emailValidator.validate(email)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Invalid email format.');
  }

  const user = await User.findOne({
    where: { email },
    attributes: {
      exclude: ['password'],
    },
  });

  if (!user) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('User not found.');
  }

  const resetPasswordOTP = await user.generateOTP();

  const isEmailSent = await sendEmail({
    from: process.env.SMTP_EMAIL,
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
            "If you didn't request a password reset, please disregard this email.",
        },
      ],
    }),
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Email could not be sent.');
  }

  const otpExpiresIn = new Date();
  otpExpiresIn.setMinutes(otpExpiresIn.getMinutes() + 10);

  user.otp = resetPasswordOTP;
  user.otpExpires = otpExpiresIn;

  await user.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'OTP sent successfully.',
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
    throw new Error('Email, OTP, and password are required.');
  }

  if (!emailValidator.validate(email)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Invalid email format.');
  }

  const user = await User.findOne({
    where: { email },
  });

  if (!user) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('User not found.');
  }

  if (currentTime > user.optExpires) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('OTP has been expired.');
  }

  if (user.otp !== otp) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error('Invalid OTP.');
  }

  if (user.password === password) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('New password cannot be the same as the old password.');
  }

  user.password = password;
  user.otp = null;
  user.optExpires = null;

  await user.save();

  const isEmailSent = await sendEmail({
    from: process.env.SMTP_EMAIL,
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
            'If you did not initiate this password reset, please contact our support team immediately.',
        },
        {
          type: 'text',
          value:
            'For security purposes, we recommend changing your password regularly and using strong, unique passwords.',
        },
      ],
    }),
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Email could not be sent.');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Password reset successfully.',
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
    throw new Error('Email is required.');
  }

  if (!emailValidator.validate(email)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Invalid email format.');
  }

  const user = await User.findOne({
    where: { email },
    attributes: {
      exclude: ['password'],
    },
  });

  if (!user) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('User not found.');
  }

  const verficationOTP = await user.generateOTP();

  const isEmailSent = await sendEmail({
    from: process.env.SMTP_EMAIL,
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
          value:
            'This new verification code will expire in 10 minutes for security purposes.',
        },
        {
          type: 'text',
          value:
            "If you didn't request a new verification code, please contact support immediately.",
        },
      ],
    }),
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Email could not be sent.');
  }

  const otpExpiresIn = new Date();
  otpExpiresIn.setMinutes(otpExpiresIn.getMinutes() + 10);

  user.otp = verficationOTP;
  user.otpExpires = otpExpiresIn;

  await user.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'OTP regenerated successfully.',
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
