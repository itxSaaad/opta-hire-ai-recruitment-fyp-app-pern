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
 *
 * @returns {Promise<void>}
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
    attributes: {
      exclude: ['password', 'otp', 'otpExpires'],
    },
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
    user,
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
 *
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
 *
 * @returns {Promise<void>}
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
 *
 * @returns {Promise<void>}
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

  const updatedUser = await user.save();

  if (!updatedUser) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Unable to update user. Please try again.');
  }

  const isEmailSent = await sendEmail({
    from: process.env.NODEMAILER_SMTP_EMAIL,
    to: user.email,
    subject: 'Welcome to OptaHire - Verify Your Email',
    html: generateEmailTemplate({
      firstName: user.firstName,
      subject: 'Welcome to OptaHire - Verify Your Email',
      content: [
        {
          type: 'heading',
          value: 'Welcome to OptaHire!',
        },
        {
          type: 'text',
          value:
            "Thank you for creating an account with us. We're excited to have you join our platform for optimized recruitment experiences.",
        },
        {
          type: 'heading',
          value: 'Verify Your Email',
        },
        {
          type: 'text',
          value:
            'To complete your registration and access all features, please verify your email using the code below:',
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
          type: 'heading',
          value: 'Getting Started',
        },
        {
          type: 'list',
          value: [
            'Complete your profile for better visibility',
            'Explore available opportunities',
            'Connect with recruiters and employers',
            'Access our AI-powered recruitment tools',
          ],
        },
        {
          type: 'cta',
          value: {
            text: 'Verify Your Account',
            link: `${process.env.CLIENT_URL}/verify-email`,
          },
        },
        {
          type: 'text',
          value:
            "If you didn't create an account, please ignore this email or contact our support team.",
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
      stripeAccountId: user.stripeAccountId,
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
 *
 * @returns {Promise<void>}
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
          type: 'heading',
          value: 'Password Reset Request',
        },
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
          type: 'heading',
          value: 'Security Reminder',
        },
        {
          type: 'list',
          value: [
            'Never share your OTP with anyone',
            'OptaHire staff will never ask for your OTP',
            "Always ensure you're on the official OptaHire website before entering credentials",
            'Consider using a password manager for stronger security',
          ],
        },
        {
          type: 'cta',
          value: {
            text: 'Reset Your Password',
            link: `${process.env.CLIENT_URL}/reset-password`,
          },
        },
        {
          type: 'text',
          value:
            "If you didn't request a password reset, please ignore this email or contact support immediately.",
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
 *
 * @returns {Promise<void>}
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
          type: 'heading',
          value: 'Password Reset Successful',
        },
        {
          type: 'text',
          value:
            'Your password has been successfully reset. You can now log in with your new password.',
        },
        {
          type: 'heading',
          value: 'Security Recommendations',
        },
        {
          type: 'list',
          value: [
            'Use strong, unique passwords for all your accounts',
            'Change passwords regularly',
            'Never share your password with anyone',
            'Enable two-factor authentication when available',
          ],
        },
        {
          type: 'text',
          value:
            'If you did not request this password change, please contact our support team immediately.',
        },
        {
          type: 'cta',
          value: {
            text: 'Log In to Your Account',
            link: `${process.env.CLIENT_URL}/login`,
          },
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
          type: 'heading',
          value: 'New Verification Code Generated',
        },
        {
          type: 'text',
          value: 'You requested a new verification code. Here is your new OTP:',
        },
        {
          type: 'otp',
          value: verficationOTP,
        },
        {
          type: 'heading',
          value: 'Important Information',
        },
        {
          type: 'list',
          value: [
            'This code will expire in 10 minutes',
            'Enter this code to verify your account',
            'Keep this code confidential',
            'Do not share this code with anyone',
          ],
        },
        {
          type: 'cta',
          value: {
            text: 'Verify Your Account',
            link: `${process.env.CLIENT_URL}/verify-email`,
          },
        },
        {
          type: 'text',
          value:
            "If you didn't request this code, please ignore this email or contact support immediately.",
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
