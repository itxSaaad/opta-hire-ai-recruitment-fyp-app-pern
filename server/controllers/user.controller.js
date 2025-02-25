const emailValidator = require('email-validator');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

const { User, Profile } = require('../models');

const sendEmail = require('../utils/nodemailer.utils');

/**
 * @desc Verify user email with OTP.
 *
 * @route POST /api/v1/users/verify-email
 * @access Private
 *
 * @param {Object} req - The request object containing the OTP.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the user is not found.
 * @throws {Error} If the email is already verified.
 */

const verifyUserEmail = asyncHandler(async (req, res) => {
  const { otp, email } = req.body;

  if (!emailValidator.validate(email)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Invalid email.');
  }

  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] },
  });

  if (!user) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('User not found.');
  }

  if (user.email !== email) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Invalid email.');
  }

  if (user.isVerified) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Email is already verified.');
  }

  if (user.otp !== otp) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Invalid OTP.');
  }

  if (user.otpExpires < new Date()) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('OTP has expired.');
  }

  user.isVerified = true;

  const isEmailSent = await sendEmail({
    from: process.env.SMTP_EMAIL,
    to: user.email,
    subject: 'Welcome to OptaHire - Email Verified',
    html: `<html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f8f9fa;
              color: #2c3e50;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
            }
            .logo {
              text-align: center;
              margin-bottom: 24px;
            }
            .header {
              font-size: 28px;
              font-weight: 600;
              text-align: center;
              color: #1a73e8;
              margin-bottom: 20px;
            }
            .message {
              font-size: 16px;
              line-height: 1.6;
              color: #4a5568;
              margin: 16px 0;
            }
            .footer {
              text-align: center;
              margin-top: 32px;
              padding-top: 16px;
              border-top: 1px solid #edf2f7;
              color: #718096;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <h1 class="header">OptaHire</h1>
            </div>
            <p class="message">Hello ${user.firstName},</p>
            <p class="message">Congratulations! Your email has been verified successfully. You can now enjoy all the features of OptaHire.</p>
            <p class="message">If you have any questions or need assistance, feel free to contact our support team.</p>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} OptaHire. All rights reserved.</p>
              <p>Optimizing Your Recruitment Journey.</p>
            </div>
          </div>
        </body>
      </html>`,
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Email could not be sent.');
  }

  await user.save();

  const profile = await Profile.findOne({ where: { userId: user.id } });

  if (!profile) {
    await Profile.create({ userId: user.id });
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Email verified successfully.',
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
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc  Update Password
 *
 * @route PUT /api/v1/users/update-password
 * @access Private
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the user is not found.
 */

const updateUserPassword = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (!user) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('User not found.');
  }

  const { currentPassword, newPassword } = req.body;

  if (!(await user.matchPassword(currentPassword))) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error('Invalid current password.');
  }

  if (currentPassword === newPassword) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('New password cannot be the same as the current password.');
  }

  user.password = newPassword;

  const isEmailSent = await sendEmail({
    from: process.env.SMTP_EMAIL,
    to: user.email,
    subject: 'OptaHire - Password Updated',
    html: `<html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f8f9fa;
              color: #2c3e50;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
            }
            .logo {
              text-align: center;
              margin-bottom: 24px;
            }
            .header {
              font-size: 28px;
              font-weight: 600;
              text-align: center;
              color: #1a73e8;
              margin-bottom: 20px;
            }
            .message {
              font-size: 16px;
              line-height: 1.6;
              color: #4a5568;
              margin: 16px 0;
            }
            .footer {
              text-align: center;
              margin-top: 32px;
              padding-top: 16px;
              border-top: 1px solid #edf2f7;
              color: #718096;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <h1 class="header">OptaHire</h1>
            </div>
            <p class="message">Hello ${user.firstName},</p>
            <p class="message">Your password has been updated successfully. If you did not request this change, please contact our support team immediately.</p>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} OptaHire. All rights reserved.</p>
              <p>Optimizing Your Recruitment Journey.</p>
            </div>
          </div>
        </body>
      </html>`,
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Email could not be sent.');
  }

  await user.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Password updated successfully.',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Gets the User Profile.
 *
 * @route GET /api/v1/users/profile
 * @access Private
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the user is not found.
 */

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] },
  });

  if (!user) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('User profile not found.');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User profile found.',
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
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Updates the User Profile.
 *
 * @route PUT /api/v1/users/profile
 * @access Private
 *
 * @param {Object} req - The request object containing updated user details.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the user is not found.
 */

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] },
  });

  if (!user) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('User profile not found.');
  }

  const { firstName, lastName, email, phone } = req.body;

  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;
  user.phone = phone || user.phone;

  if (email) {
    user.email = emailValidator.validate(email) ? email : user.email;
  }

  await user.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Profile updated successfully.',
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
  });
});

/**
 * @desc Deletes the user profile.
 *
 * @route DELETE /api/v1/users/profile
 * @access Private
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the user is not found.
 */

const deleteUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (!user) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('User profile not found.');
  }

  const isEmailSent = await sendEmail({
    from: process.env.SMTP_EMAIL,
    to: user.email,
    subject: 'OptaHire - Profile Deleted',
    html: `<html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f8f9fa;
              color: #2c3e50;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
            }
            .logo {
              text-align: center;
              margin-bottom: 24px;
            }
            .header {
              font-size: 28px;
              font-weight: 600;
              text-align: center;
              color: #1a73e8;
              margin-bottom: 20px;
            }
            .message {
              font-size: 16px;
              line-height: 1.6;
              color: #4a5568;
              margin: 16px 0;
            }
            .footer {
              text-align: center;
              margin-top: 32px;
              padding-top: 16px;
              border-top: 1px solid #edf2f7;
              color: #718096;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <h1 class="header">OptaHire</h1>
            </div>
            <p class="message">Hello ${user.firstName},</p>
            <p class="message">Your profile has been deleted successfully. If you did not request this change, please contact our support team immediately.</p>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} OptaHire. All rights reserved.</p>
              <p>Optimizing Your Recruitment Journey.</p>
            </div>
          </div>
        </body>
      </html>`,
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Email could not be sent.');
  }

  await user.destroy();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Profile deleted successfully.',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Gets all users.
 *
 * @route GET /api/v1/users
 * @access Private AND Admin
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */

const getAllUsersProfile = asyncHandler(async (req, res) => {
  const query = {};

  if (req.query.role) {
    query[req.query.role] = true;
  }

  if (req.query.email) {
    query.email = req.query.email;
  }

  const users = await User.findAll({
    where: query,
    attributes: { exclude: ['password'] },
  });

  if (users.length === 0) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('No users found.');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Users found.',
    count: users.length,
    users,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Gets a user by ID.
 *
 * @route GET /api/v1/users/:id
 * @access Private AND Admin
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */

const getUserProfileById = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password'] },
  });

  if (!user) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('User not found.');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User found.',
    user,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Updates a user by ID.
 *
 * @route PUT /api/v1/users/:id
 * @access Private AND Admin
 *
 * @param {Object} req - The request object containing updated user details.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the user is not found.
 */

const updateUserProfileById = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password'] },
  });

  if (!user) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('User not found.');
  }

  const { firstName, lastName, email, phone, role } = req.body;

  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;
  user.phone = phone || user.phone;

  if (email) {
    user.email = emailValidator.validate(email) ? email : user.email;
  }

  user.isAdmin = role === 'admin' ? true : user.isAdmin;
  user.isRecruiter = role === 'recruiter' ? true : user.isRecruiter;
  user.isInterviewer = role === 'interviewer' ? true : user.isInterviewer;
  user.isCandidate = role === 'candidate' ? true : user.isCandidate;

  await user.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User updated successfully.',
    user,
  });
});

/**
 * @desc Deletes a user by ID.
 *
 * @route DELETE /api/v1/users/:id
 * @access Private AND Admin
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the user is not found.
 */

const deleteUserById = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password'] },
  });

  if (!user) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('User not found.');
  }

  const isEmailSent = await sendEmail({
    from: process.env.SMTP_EMAIL,
    to: user.email,
    subject: 'OptaHire - Account Deleted',
    html: `<html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f8f9fa;
              color: #2c3e50;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
            }
            .logo {
              text-align: center;
              margin-bottom: 24px;
            }
            .header {
              font-size: 28px;
              font-weight: 600;
              text-align: center;
              color: #1a73e8;
              margin-bottom: 20px;
            }
            .message {
              font-size: 16px;
              line-height: 1.6;
              color: #4a5568;
              margin: 16px 0;
            }
            .footer {
              text-align: center;
              margin-top: 32px;
              padding-top: 16px;
              border-top: 1px solid #edf2f7;
              color: #718096;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <h1 class="header">OptaHire</h1>
            </div>
            <p class="message">Hello ${user.firstName},</p>
            <p class="message">Your account has been deleted due to violation of our rules and policies. If you believe this is a mistake, please contact our support team immediately.</p>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} OptaHire. All rights reserved.</p>
              <p>Optimizing Your Recruitment Journey.</p>
            </div>
          </div>
        </body>
      </html>`,
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Email could not be sent.');
  }

  await user.destroy();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User deleted successfully.',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Deletes a user permanently by ID.
 *
 * @route DELETE /api/v1/users/:id/permanent
 * @access Private AND Admin
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the user is not found.
 */

const deleteUserPermById = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password'] },
    paranoid: false,
  });

  if (!user) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('User not found.');
  }

  const isEmailSent = await sendEmail({
    from: process.env.SMTP_EMAIL,
    to: user.email,
    subject: 'OptaHire - Account Permanently Deleted',
    html: `<html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f8f9fa;
              color: #2c3e50;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
            }
            .logo {
              text-align: center;
              margin-bottom: 24px;
            }
            .header {
              font-size: 28px;
              font-weight: 600;
              text-align: center;
              color: #1a73e8;
              margin-bottom: 20px;
            }
            .message {
              font-size: 16px;
              line-height: 1.6;
              color: #4a5568;
              margin: 16px 0;
            }
            .footer {
              text-align: center;
              margin-top: 32px;
              padding-top: 16px;
              border-top: 1px solid #edf2f7;
              color: #718096;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <h1 class="header">OptaHire</h1>
            </div>
            <p class="message">Hello ${user.firstName},</p>
            <p class="message">Your account has been permanently deleted. If you believe this is a mistake, please contact our support team immediately.</p>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} OptaHire. All rights reserved.</p>
              <p>Optimizing Your Recruitment Journey.</p>
            </div>
          </div>
        </body>
      </html>`,
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Email could not be sent.');
  }

  await user.destroy({ force: true });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User permanently deleted successfully.',
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  verifyUserEmail,
  updateUserPassword,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getAllUsersProfile,
  getUserProfileById,
  updateUserProfileById,
  deleteUserById,
  deleteUserPermById,
};
