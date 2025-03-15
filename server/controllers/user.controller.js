const emailValidator = require('email-validator');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');

const { User, Resume } = require('../models');

const {
  sendEmail,
  generateEmailTemplate,
} = require('../utils/nodemailer.utils');

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
    throw new Error('Please enter a valid email address.');
  }

  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] },
  });

  if (!user) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Unable to find your account. Please try again.');
  }

  if (user.email !== email) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('The email address does not match your account.');
  }

  if (user.isVerified) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(
      'Your email is already verified. You can proceed to login.'
    );
  }

  if (user.otp !== otp) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Invalid verification code. Please check and try again.');
  }

  if (user.otpExpires < new Date()) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Verification code has expired. Please request a new one.');
  }

  user.isVerified = true;

  const existingProfile = await Resume.findOne({ where: { userId: user.id } });

  if (!existingProfile) {
    await Resume.create({ userId: user.id });
  }

  await user.save();

  const isEmailSent = await sendEmail({
    from: process.env.NODEMAILER_SMTP_EMAIL,
    to: user.email,
    subject: 'Welcome to OptaHire - Email Verified',
    html: generateEmailTemplate({
      firstName: user.firstName,
      subject: 'Welcome to OptaHire - Email Verified',
      content: [
        {
          type: 'text',
          value:
            'Congratulations! Your email has been verified successfully. You can now enjoy all the features of OptaHire.',
        },
        {
          type: 'text',
          value:
            'If you have any questions or need assistance, feel free to contact our support team.',
        },
        {
          type: 'text',
          value: 'Thank you for using OptaHire.',
        },
      ],
    }),
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Unable to send confirmation email. Please try again later.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Your email has been verified successfully. Welcome to OptaHire!',
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
    throw new Error('Unable to find your account. Please try again.');
  }

  const { currentPassword, newPassword } = req.body;

  if (!(await user.matchPassword(currentPassword))) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error(
      'Current password is incorrect. Please check and try again.'
    );
  }

  if (currentPassword === newPassword) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(
      'New password must be different from your current password.'
    );
  }

  user.password = newPassword;

  await user.save();

  const isEmailSent = await sendEmail({
    from: process.env.NODEMAILER_SMTP_EMAIL,
    to: user.email,
    subject: 'OptaHire - Password Updated',
    html: generateEmailTemplate({
      firstName: user.firstName,
      subject: 'OptaHire - Password Updated',
      content: [
        {
          type: 'text',
          value:
            'Your password has been updated successfully. If you did not make this change, please contact support immediately.',
        },
        {
          type: 'text',
          value: 'Thank you for using OptaHire.',
        },
      ],
    }),
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Password updated but confirmation email could not be sent.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message:
      'Password updated successfully. You can now login with your new password.',
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
    throw new Error(
      'Unable to locate your profile. Please try again or contact support.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Profile retrieved successfully.',
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
    throw new Error(
      'Unable to find your profile. Please refresh and try again.'
    );
  }

  const { firstName, lastName, email, phone } = req.body;

  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;
  user.phone = phone || user.phone;

  if (email) {
    if (!emailValidator.validate(email)) {
      res.status(StatusCodes.BAD_REQUEST);
      throw new Error('Please enter a valid email address format.');
    }
    user.email = email;
  }

  const updatedUser = await user.save();

  if (!updatedUser) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Profile could not be updated. Please try again.');
  }

  const isEmailSent = await sendEmail({
    from: process.env.NODEMAILER_SMTP_EMAIL,
    to: user.email,
    subject: 'OptaHire - Profile Updated',
    html: generateEmailTemplate({
      firstName: user.firstName,
      subject: 'OptaHire - Profile Updated',
      content: [
        {
          type: 'text',
          value:
            'Your profile has been updated successfully. If you did not make this change, please contact support immediately.',
        },
        {
          type: 'text',
          value: 'Thank you for using OptaHire.',
        },
      ],
    }),
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Your profile has been updated successfully.',
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
    throw new Error('We could not find your profile. Please try again.');
  }

  const isEmailSent = await sendEmail({
    from: process.env.NODEMAILER_SMTP_EMAIL,
    to: user.email,
    subject: 'OptaHire - Account Deletion Confirmation',
    html: generateEmailTemplate({
      firstName: user.firstName,
      subject: 'OptaHire - Account Deletion Confirmation',
      content: [
        {
          type: 'text',
          value:
            'We have successfully processed your account deletion request. If you did not initiate this action, please contact our support team immediately.',
        },
        {
          type: 'text',
          value: 'Thank you for being part of OptaHire.',
        },
      ],
    }),
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Account deleted but confirmation email could not be sent.'
    );
  }

  await user.destroy();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Your account has been successfully deleted.',
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
  const { role, email, firstName, lastName } = req.query;
  let whereClause = {};

  if (role) {
    switch (role.toLowerCase()) {
      case 'admin':
        whereClause.isAdmin = true;
        break;
      case 'recruiter':
        whereClause.isRecruiter = true;
        break;
      case 'interviewer':
        whereClause.isInterviewer = true;
        break;
      case 'candidate':
        whereClause.isCandidate = true;
        break;
      default:
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Invalid user role. Please select a valid role.');
    }
  }

  if (email) {
    whereClause.email = { [Op.iLike]: `%${email}%` };
  }

  if (firstName) {
    whereClause.firstName = { [Op.iLike]: `%${firstName}%` };
  }

  if (lastName) {
    whereClause.lastName = { [Op.iLike]: `%${lastName}%` };
  }

  const users = await User.findAndCountAll({
    where: whereClause,
    attributes: {
      exclude: ['password', 'otp', 'otpExpires'],
    },
    order: [['createdAt', 'DESC']],
    paranoid: true,
  });

  if (!users.count) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('No users found. Try adjusting your search criteria.');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Found ${users.count} user${
      users.count === 1 ? '' : 's'
    } matching your search.`,
    count: users.count,
    users: users.rows,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Gets a user by ID.
 *
 * @route GET /api/v1/users/:id
 * @access Private (Admin)
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */

const getUserProfileById = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password', 'otp', 'otpExpires'] },
  });

  if (!user) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(
      'This user profile could not be found. Please verify the user ID and try again.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User profile retrieved successfully.',
    user,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Updates a user by ID.
 *
 * @route PUT /api/v1/users/:id
 * @access Private (Admin)
 *
 * @param {Object} req - The request object containing updated user details.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the user is not found.
 */

const updateUserProfileById = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, role } = req.body;

  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password'] },
  });

  if (!user) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(
      'User profile not found. Please check the ID and try again.'
    );
  }

  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;
  user.phone = phone || user.phone;

  if (email) {
    if (!emailValidator.validate(email)) {
      res.status(StatusCodes.BAD_REQUEST);
      throw new Error('Please enter a valid email address format.');
    }
    user.email = email;
  }

  user.isAdmin = role === 'admin' ? true : user.isAdmin;
  user.isRecruiter = role === 'recruiter' ? true : user.isRecruiter;
  user.isInterviewer = role === 'interviewer' ? true : user.isInterviewer;
  user.isCandidate = role === 'candidate' ? true : user.isCandidate;

  const updatedUser = await user.save();

  if (!updatedUser) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('User profile could not be updated. Please try again.');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User profile has been updated successfully.',
    user,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Deletes a user by ID.
 *
 * @route DELETE /api/v1/users/:id
 * @access Private (Admin)
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
    throw new Error(
      'Unable to locate user account. Please verify and try again.'
    );
  }

  const isDestroyed = await user.destroy();

  if (!isDestroyed) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Account deletion failed. Please try again or contact support.'
    );
  }

  const isEmailSent = await sendEmail({
    from: process.env.NODEMAILER_SMTP_EMAIL,
    to: user.email,
    subject: 'OptaHire - Account Deactivated',
    html: generateEmailTemplate({
      firstName: user.firstName,
      subject: 'OptaHire - Account Deactivated',
      content: [
        {
          type: 'text',
          value:
            'Your OptaHire account has been deactivated. If you believe this was done in error, please contact our support team.',
        },
        {
          type: 'text',
          value: 'Thank you for being part of OptaHire.',
        },
      ],
    }),
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Account deactivated but notification emails could not be delivered.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Account successfully deactivated.',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Deletes a user permanently by ID.
 *
 * @route DELETE /api/v1/users/:id/permanent
 * @access Private (Admin)
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
    throw new Error('The requested user account could not be found.');
  }

  const isDestroyed = await user.destroy({ force: true });

  if (!isDestroyed) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Unable to process deletion request. Please try again.');
  }

  const isEmailSent = await sendEmail({
    from: process.env.NODEMAILER_SMTP_EMAIL,
    to: user.email,
    subject: 'OptaHire - Account Permanently Deleted',
    html: generateEmailTemplate({
      firstName: user.firstName,
      subject: 'OptaHire - Account Permanently Deleted',
      content: [
        {
          type: 'text',
          value:
            'Your OptaHire account and all associated data have been permanently deleted.',
        },
        {
          type: 'text',
          value:
            'If you did not request this action, please contact our support team immediately.',
        },
      ],
    }),
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Account deleted but unable to send confirmation email.');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Account and associated data permanently deleted.',
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
