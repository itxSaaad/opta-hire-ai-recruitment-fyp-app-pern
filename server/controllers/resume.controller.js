const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

const { User, Profile } = require('../models');

const { validateString, validateArray } = require('../utils/validation.utils');

/**
 * @desc Creates the User Resume.
 *
 * @route POST /api/v1/resume
 * @access Private
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the user is not found.
 */

const createUserResume = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const {
    title,
    summary,
    headline,
    skills,
    experience,
    education,
    industry,
    availability,
    company,
    achievements,
    portfolio,
  } = req.body;

  if (!title || !summary || !skills || !experience || !education) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Missing required fields');
  }

  const validatedData = {
    title: validateString(title, 'Title', 3, 100),
    summary: validateString(summary, 'Summary', 10, 1000),
    headline: headline ? validateString(headline, 'Headline', 3, 200) : null,
    skills: validateArray(skills, 'Skills', 1, 20),
    experience: validateArray(experience, 'Experience', 1, 10),
    education: validateArray(education, 'Education', 1, 5),
    industry: industry ? validateString(industry, 'Industry', 2, 100) : null,
    availability: availability
      ? validateString(availability, 'Availability', 2, 50)
      : null,
    company: company ? validateString(company, 'Company', 2, 100) : null,
    achievements: achievements
      ? validateArray(achievements, 'Achievements', 0, 10)
      : [],
    portfolio: portfolio ? validateArray(portfolio, 'Portfolio', 0, 10) : [],
    userId,
  };

  const existingProfile = await Profile.findOne({ where: { userId } });

  if (existingProfile) {
    res.status(StatusCodes.CONFLICT);
    throw new Error('Profile already exists for this user.');
  }

  const profile = await Profile.create(validatedData);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Profile created successfully.',
    profile,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Gets the User Resume.
 *
 * @route GET /api/v1/resume/user
 * @access Private
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the user is not found.
 */

const getUserResume = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const profile = await Profile.findOne({ where: { userId } });

  if (!profile) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Profile not found for this user.');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Profile retrieved successfully.',
    profile,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Updates the User Resume.
 *
 * @route PUT /api/v1/resume/user
 * @access Private
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the user is not found.
 */

const updateUserResume = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const {
    title,
    summary,
    headline,
    skills,
    experience,
    education,
    industry,
    availability,
    company,
    achievements,
    portfolio,
  } = req.body;

  if (!title || !summary || !skills || !experience || !education) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Missing required fields');
  }

  const validatedData = {
    title: validateString(title, 'Title', 3, 100),
    summary: validateString(summary, 'Summary', 10, 1000),
    headline: headline ? validateString(headline, 'Headline', 3, 200) : null,
    skills: validateArray(skills, 'Skills', 1, 20),
    experience: validateArray(experience, 'Experience', 1, 10),
    education: validateArray(education, 'Education', 1, 5),
    industry: industry ? validateString(industry, 'Industry', 2, 100) : null,
    availability: availability
      ? validateString(availability, 'Availability', 2, 50)
      : null,
    company: company ? validateString(company, 'Company', 2, 100) : null,
    achievements: achievements
      ? validateArray(achievements, 'Achievements', 0, 10)
      : [],
    portfolio: portfolio ? validateArray(portfolio, 'Portfolio', 0, 10) : [],
    userId,
  };

  const profile = await Profile.findOne({ where: { userId } });

  if (!profile) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Profile not found for this user.');
  }

  await profile.update(validatedData);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Profile updated successfully.',
    profile,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Deletes the user profile.
 *
 * @route DELETE /api/v1/resume/user
 * @access Private
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the user is not found.
 */

const deleteUserResume = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const profile = await Profile.findOne({ where: { userId } });

  if (!profile) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Profile not found for this user.');
  }

  await profile.destroy();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Profile deleted successfully.',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Gets All Resumes.
 *
 * @route GET /api/v1/resume
 * @access Private And Admin
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the user is not found.
 */

const getAllUserResumes = asyncHandler(async (req, res) => {
  const profiles = await Profile.findAll({
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'email', 'phone'],
      },
    ],
  });

  if (!profiles || profiles.length === 0) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('No profiles found.');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Profiles retrieved successfully.',
    count: profiles.length,
    profiles,
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  createUserResume,
  getUserResume,
  updateUserResume,
  deleteUserResume,
  getAllUserResumes,
};
