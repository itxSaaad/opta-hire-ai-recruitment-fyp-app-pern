const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');

const { User, Resume } = require('../models');

const { validateString, validateArray } = require('../utils/validation.utils');

/**
 * @desc Creates the User Resume.
 *
 * @route POST /api/v1/resumes
 * @access Private
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the user is not found.
 */

const createResume = asyncHandler(async (req, res) => {
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
    throw new Error(
      'Please fill in all required fields to create your resume.'
    );
  }

  const validatedData = {
    title: title ? validateString(title, 'Title', 3, 100) : null,
    summary: summary ? validateString(summary, 'Summary', 10, 1000) : null,
    headline: headline ? validateString(headline, 'Headline', 3, 200) : null,
    skills: skills ? validateArray(skills, 'Skills', 1, 20) : null,
    experience: experience
      ? validateString(experience, 'Experience', 10, 5000)
      : null,
    education: education
      ? validateString(education, 'Education', 10, 2000)
      : null,
    industry: industry ? validateString(industry, 'Industry', 2, 100) : null,
    availability: availability
      ? validateString(availability, 'Availability', 2, 50)
      : null,
    company: company ? validateString(company, 'Company', 2, 100) : null,
    achievements: achievements
      ? validateString(achievements, 'Achievements', 0, 1000)
      : null,
    portfolio: portfolio
      ? validateString(portfolio, 'Portfolio', 0, 255)
      : null,
    userId,
  };

  const existingProfile = await Resume.findOne({ where: { userId } });

  if (existingProfile) {
    res.status(StatusCodes.CONFLICT);
    throw new Error(
      'You already have an existing resume. Please update it instead.'
    );
  }

  const profile = await Resume.create(validatedData);

  if (!profile) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Unable to create resume. Please try again.');
  }

  res.status(StatusCodes.CREATED).json({
    success: true,
    message:
      'Resume created successfully! You can now start applying for jobs.',
    profile,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Gets All Resumes.
 *
 * @route GET /api/v1/resumes
 * @access Private (Admin)
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the user is not found.
 */

const getAllResumes = asyncHandler(async (req, res) => {
  const { industry, availability, skills, minRating } = req.query;
  let whereClause = {};

  if (industry) {
    whereClause.industry = industry;
  }

  if (availability) {
    whereClause.availability = availability;
  }

  if (skills) {
    whereClause.skills = {
      [Op.overlap]: Array.isArray(skills) ? skills : [skills],
    };
  }

  if (minRating) {
    whereClause.rating = {
      [Op.gte]: parseFloat(minRating),
    };
  }

  const profiles = await Resume.findAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'email', 'phone'],
      },
    ],
    order: [
      ['rating', 'DESC'],
      ['createdAt', 'DESC'],
    ],
  });

  if (!profiles || profiles.length === 0) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('No resumes found matching the criteria.');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Successfully retrieved all candidate resumes',
    count: profiles.length,
    profiles,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Gets the User Resume.
 *
 * @route GET /api/v1/resumes/user
 * @access Private
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the user is not found.
 */

const getResumeForUser = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const profile = await Resume.findOne({ where: { userId } });

  if (!profile) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(
      'No resume found. Please create your resume to get started.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Resume loaded successfully.',
    profile,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Updates the User Resume.
 *
 * @route PUT /api/v1/resumes/user
 * @access Private
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the user is not found.
 */

const updateResume = asyncHandler(async (req, res) => {
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
    throw new Error(
      'Please provide all required fields: title, summary, skills, experience, and education'
    );
  }

  const validatedData = {
    title: title ? validateString(title, 'Title', 3, 100) : null,
    summary: summary ? validateString(summary, 'Summary', 10, 1000) : null,
    headline: headline ? validateString(headline, 'Headline', 3, 200) : null,
    skills: skills ? validateArray(skills, 'Skills', 1, 20) : null,
    experience: experience
      ? validateString(experience, 'Experience', 10, 5000)
      : null,
    education: education
      ? validateString(education, 'Education', 10, 2000)
      : null,
    industry: industry ? validateString(industry, 'Industry', 2, 100) : null,
    availability: availability
      ? validateString(availability, 'Availability', 2, 50)
      : null,
    company: company ? validateString(company, 'Company', 2, 100) : null,
    achievements: achievements
      ? validateString(achievements, 'Achievements', 0, 1000)
      : null,
    portfolio: portfolio
      ? validateString(portfolio, 'Portfolio', 0, 255)
      : null,
    userId,
  };

  const profile = await Resume.findOne({ where: { userId } });

  if (!profile) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('No resume found. Please create a resume first');
  }

  await profile.update(validatedData);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Your resume has been successfully updated',
    profile,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Deletes the user profile.
 *
 * @route DELETE /api/v1/resumes/user
 * @access Private
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the user is not found.
 */

const deleteResume = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const profile = await Resume.findOne({ where: { userId } });

  if (!profile) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('You currently do not have a resume in our system.');
  }

  const deletedProfile = await profile.destroy();

  if (!deletedProfile) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Failed to delete resume. Please try again later.');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Your resume has been successfully deleted from our system.',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Updates the Resume by ID.
 *
 * @route PUT /api/v1/resumes/:id
 * @access Private (Admin)
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the user is not found.
 */

const updateResumeById = asyncHandler(async (req, res) => {
  const profileId = req.params.id;

  const profile = await Resume.findByPk(profileId, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'email', 'phone'],
      },
    ],
  });

  if (!profile) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('No resume found with the provided ID.');
  }

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

  const validatedData = {
    title: title ? validateString(title, 'Title', 3, 100) : null,
    summary: summary ? validateString(summary, 'Summary', 10, 1000) : null,
    headline: headline ? validateString(headline, 'Headline', 3, 200) : null,
    skills: skills ? validateArray(skills, 'Skills', 1, 20) : null,
    experience: experience
      ? validateString(experience, 'Experience', 10, 5000)
      : null,
    education: education
      ? validateString(education, 'Education', 10, 2000)
      : null,
    industry: industry ? validateString(industry, 'Industry', 2, 100) : null,
    availability: availability
      ? validateString(availability, 'Availability', 2, 50)
      : null,
    company: company ? validateString(company, 'Company', 2, 100) : null,
    achievements: achievements
      ? validateString(achievements, 'Achievements', 0, 1000)
      : null,
    portfolio: portfolio
      ? validateString(portfolio, 'Portfolio', 0, 255)
      : null,
  };

  const updatedProfile = await profile.update(validatedData);

  if (!updatedProfile) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Unable to update resume. Please try again.');
  }

  const emailContent = [
    {
      type: 'text',
      value: 'Your resume has been updated successfully.',
    },
    { type: 'heading', value: 'Resume Details' },
    {
      type: 'list',
      value: [
        `Title: ${updatedProfile.title}`,
        `Industry: ${updatedProfile.industry}`,
        `Headline: ${updatedProfile.headline}`,
        `Skills: ${updatedProfile.skills.join(', ')}`,
        `Experience: ${updatedProfile.experience}`,
        `Education: ${updatedProfile.education}`,
      ],
    },
  ];

  const isEmailSent = await sendEmail({
    to: updatedProfile.user.email,
    subject: 'OptaHire - Resume Updated',
    html: generateEmailTemplate({
      firstName: updatedProfile.user.firstName,
      subject: 'Resume Updated',
      content: emailContent,
    }),
  });

  if (!isEmailSent) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Resume updated but notification email could not be sent.');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Resume has been successfully updated',
    updatedProfile,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Deletes the Resume by ID.
 *
 * @route DELETE /api/v1/resumes/:id
 * @access Private (Admin)
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the user is not found.
 */

const deleteResumeById = asyncHandler(async (req, res) => {
  const profileId = req.params.id;

  const profile = await Resume.findByPk(profileId, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'email', 'phone'],
      },
    ],
  });

  if (!profile) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Resume not found. Please check the ID and try again.');
  }

  const deletedProfile = await profile.destroy();

  if (!deletedProfile) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Failed to delete resume. Please try again later.');
  }

  const emailContent = [
    {
      type: 'text',
      value: 'Your resume has been removed from our system.',
    },
    { type: 'heading', value: 'Resume Details' },
    {
      type: 'list',
      value: [
        `Title: ${profile.title}`,
        `Industry: ${profile.industry}`,
        `Headline: ${profile.headline}`,
        `Skills: ${profile.skills.join(', ')}`,
        `Experience: ${profile.experience}`,
        `Education: ${profile.education}`,
      ],
    },
  ];

  const isEmailSent = await sendEmail({
    to: profile.user.email,
    subject: 'OptaHire - Resume Deleted',
    html: generateEmailTemplate({
      firstName: profile.user.firstName,
      subject: 'Resume Deleted',
      content: emailContent,
    }),
  });

  if (!isEmailSent) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Resume deleted but notification email could not be sent.');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Resume has been successfully deleted',
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  createResume,
  getAllResumes,
  getResumeForUser,
  updateResume,
  deleteResume,
  updateResumeById,
  deleteResumeById,
};
