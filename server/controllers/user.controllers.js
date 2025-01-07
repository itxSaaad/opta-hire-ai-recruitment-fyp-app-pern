const emailValidator = require('email-validator');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

const { User } = require('../models');

/**
 * @desc Logs in a user.
 *
 * @route POST /api/v1/users/login
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

  const user = await User.findOne({ where: { email } });

  // if (!user) {
  //   res.status(StatusCodes.UNAUTHORIZED);
  //   throw new Error('Invalid email or password.');
  // }

  const isPasswordCorrect = await user.validatePassword(password);

  console.log(isPasswordCorrect);

  if (!isPasswordCorrect) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error('Invalid email or password.');
  }

  const token = user.generateAuthToken();

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
    token,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Registers a new user.
 *
 * @route POST /api/v1/users/register
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

  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    res.status(StatusCodes.CONFLICT);
    throw new Error('User already exists.');
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

  const token = user.generateAuthToken();

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
    token,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Resets the user password.
 *
 * @route POST /api/v1/users/reset-password
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
  loginUser,
  registerUser,
  getUserProfile,
  resetPassword,
  updateUserProfile,
  deleteUser,
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  deleteUserPermById,
};
