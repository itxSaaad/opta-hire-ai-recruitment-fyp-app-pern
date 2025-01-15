const emailValidator = require('email-validator');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

const { User } = require('../models');

/**
 * @desc Gets the user profile.
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
      role: user.role,
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Updates the user profile.
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
      role: user.role,
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
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (!user) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('User profile not found.');
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
const getUsers = asyncHandler(async (req, res) => {
  const query = {};

  if (req.query.role) {
    query.role = req.query.role;
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
const getUserById = asyncHandler(async (req, res) => {
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
const updateUserById = asyncHandler(async (req, res) => {
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

  if (role) {
    user.role = ['admin', 'recruiter', 'interviewer', 'candidate'].includes(
      role
    )
      ? role
      : user.role;
  }

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

  await user.destroy({ force: true });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User permanently deleted successfully.',
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  deleteUserPermById,
};
