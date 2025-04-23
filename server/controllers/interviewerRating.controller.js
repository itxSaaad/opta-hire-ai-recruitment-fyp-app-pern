const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');

const { InterviewerRating, User, Job, Contract } = require('../models');

const {
  sendEmail,
  generateEmailTemplate,
} = require('../utils/nodemailer.utils');
const { validateString } = require('../utils/validation.utils');

/**
 * @desc    Create new interviewer rating
 *
 * @route   POST /api/interviewer-ratings
 * @access  Private (Recruiter, Admin)
 *
 * @param  req - Request object
 * @param  res - Response object
 *
 * @returns {Promise<void>}
 */

const createInterviewerRating = asyncHandler(async (req, res) => {
  const { rating, feedback, interviewerId, recruiterId, jobId, contractId } =
    req.body;

  if (
    rating == null ||
    !feedback ||
    !interviewerId ||
    !recruiterId ||
    !jobId ||
    !contractId
  ) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Please fill in all required fields to submit the rating.');
  }

  if (rating < 1 || rating > 5) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Rating must be between 1 and 5 stars.');
  }

  if (feedback) {
    validateString(feedback, 'Feedback', 2, 500);
  }

  const [interviewer, recruiter, job, contract] = await Promise.all([
    User.findByPk(interviewerId),
    User.findByPk(recruiterId),
    Job.findByPk(jobId),
    Contract.findByPk(contractId),
  ]);

  if (!interviewer) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Interviewer not found. Please check and try again.');
  }

  if (!recruiter) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Recruiter not found. Please check and try again.');
  }

  if (!job) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Job posting not found. Please check and try again.');
  }

  if (!contract) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Contract not found. Please check and try again.');
  }

  const existingInterviewerRating = await InterviewerRating.findOne({
    where: {
      [Op.and]: [{ jobId }, { contractId }, { interviewerId }, { recruiterId }],
    },
  });

  if (existingInterviewerRating) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Rating already exists for this interview session.');
  }

  const newInterviewerRating = await InterviewerRating.create({
    rating,
    feedback,
    interviewerId,
    recruiterId,
    jobId,
    contractId,
  });

  if (!newInterviewerRating) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Unable to save rating. Please try again.');
  }

  const emailContent = [
    { type: 'heading', value: 'New Interviewer Rating Submitted' },
    {
      type: 'text',
      value:
        'A new rating has been submitted for your interview performance. We appreciate your contribution to the hiring process.',
    },
    {
      type: 'heading',
      value: 'Rating Details',
    },
    {
      type: 'list',
      value: [
        `Job Title: ${job.title}`,
        `Rating: ${rating}/5`,
        `Feedback: ${feedback}`,
        `Company: ${job.company}`,
        `Contract ID: ${contractId}`,
      ],
    },
    {
      type: 'heading',
      value: 'What You Can Do Next',
    },
    {
      type: 'list',
      value: [
        'Review your interview performance metrics',
        'Apply for more interview opportunities',
        'Update your availability for future sessions',
        'Contact the recruiter for additional feedback',
      ],
    },
    {
      type: 'cta',
      value: {
        text: 'View Your Dashboard',
        link: `${process.env.CLIENT_URL}/interviewer/dashboard`,
      },
    },
    {
      type: 'text',
      value:
        'If you have any questions about this rating, please contact our support team.',
    },
  ];

  const isEmailSent = await sendEmail({
    from: process.env.NODEMAILER_SMTP_EMAIL,
    to: interviewer.email,
    subject: 'OptaHire - New Rating Received',
    html: generateEmailTemplate({
      firstName: interviewer.firstName,
      subject: 'New Rating Received',
      content: emailContent,
    }),
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Interviewer rating submitted successfully but email could not be sent.'
    );
  }

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Rating submitted successfully',
    interviewRating: newInterviewerRating,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Get all interviewer ratings
 *
 * @route   GET /api/interviewer-ratings
 * @access  Private (Recruiter, Interviewer, Admin)
 *
 * @param   req - Request object
 * @param   res - Response object
 *
 * @returns {Promise<void>}
 */

const getAllInterviewerRatings = asyncHandler(async (req, res) => {
  const {
    rating,
    interviewerId,
    recruiterId,
    jobId,
    contractId,
    search,
    limit,
  } = req.query;
  let whereClause = {};

  if (rating) whereClause.rating = rating;
  if (interviewerId) whereClause.interviewerId = interviewerId;
  if (recruiterId) whereClause.recruiterId = recruiterId;
  if (jobId) whereClause.jobId = jobId;
  if (contractId) whereClause.contractId = contractId;

  if (search) {
    whereClause = {
      ...whereClause,
      [Op.or]: [{ feedback: { [Op.iLike]: `%${search}%` } }],
    };
  }

  const interviewerRatings = await InterviewerRating.findAll({
    where: whereClause,
    limit: limit ? parseInt(limit) : null,
    include: [
      {
        model: User,
        as: 'interviewer',
        attributes: ['id', 'firstName', 'lastName', 'email'],
      },
      {
        model: User,
        as: 'recruiter',
        attributes: ['id', 'firstName', 'lastName', 'email'],
      },
      { model: Job, as: 'job', attributes: ['id', 'title', 'company'] },
      { model: Contract, as: 'contract', attributes: ['id'] },
    ],
  });

  if (!interviewerRatings || interviewerRatings.length === 0) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(
      'No interviewer ratings found. Please adjust your filters and try again.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Successfully retrieved ${interviewerRatings.length} ratings`,
    count: interviewerRatings.length,
    interviewerRatings,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Get interviewer rating by ID
 *
 * @route   GET /api/interviewer-ratings/:id
 * @access  Private (Recruiter, Admin, Interviewer)
 *
 * @param   {object} req - Request object
 * @param   {object} res - Response object
 *
 * @returns {Promise<void>}
 */

const getInterviewerRatingById = asyncHandler(async (req, res) => {
  const interviewerRating = await InterviewerRating.findByPk(req.params.id, {
    include: [
      {
        model: User,
        as: 'interviewer',
        attributes: ['id', 'firstName', 'lastName', 'email'],
      },
      {
        model: User,
        as: 'recruiter',
        attributes: ['id', 'firstName', 'lastName', 'email'],
      },
      { model: Job, as: 'job', attributes: ['id', 'title', 'company'] },
      { model: Contract, as: 'contract', attributes: ['id'] },
    ],
  });

  if (!interviewerRating) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Rating not found. Please check and try again.');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Rating found',
    interviewerRating,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Update interviewer rating
 *
 * @route   PUT /api/interviewer-ratings/:id
 * @access  Private (Recruiter, Admin)
 *
 * @param   {object} req - Request object
 * @param   {object} res - Response object
 *
 * @returns {Promise<void>}
 *
 */

const updateInterviewerRating = asyncHandler(async (req, res) => {
  const { rating, feedback } = req.body;

  if (!rating && !feedback) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Please provide either rating or feedback to update.');
  }

  if (rating !== undefined) {
    if (rating < 0 || rating > 5) {
      res.status(StatusCodes.BAD_REQUEST);
      throw new Error('Rating must be between 0 and 5 stars.');
    }
  }

  if (feedback) {
    validateString(feedback, 'Feedback', 10, 1000);
  }

  const interviewerRating = await InterviewerRating.findByPk(req.params.id, {
    include: [
      { model: User, as: 'interviewer' },
      { model: User, as: 'recruiter' },
      { model: Job, as: 'job' },
    ],
  });

  if (!interviewerRating) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Rating not found. Please check and try again.');
  }

  const updatedInterviewerRating = await interviewerRating.update({
    ...(rating !== undefined && { rating }),
    ...(feedback && { feedback }),
  });

  if (!updatedInterviewerRating) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Unable to update rating. Please try again.');
  }

  const emailContent = [
    { type: 'heading', value: 'Rating Update Notification' },
    {
      type: 'text',
      value:
        'Your interview rating has been updated. We value your contribution to our platform and want to keep you informed of any changes to your ratings.',
    },
    {
      type: 'heading',
      value: 'Updated Rating Details',
    },
    {
      type: 'list',
      value: [
        `Job Title: ${interviewerRating.job.title}`,
        `Rating: ${updatedInterviewerRating.rating}/5`,
        `Feedback: ${updatedInterviewerRating.feedback}`,
        `Company: ${interviewerRating.job.company}`,
        `Contract ID: ${interviewerRating.contractId}`,
      ],
    },
    {
      type: 'heading',
      value: 'What You Can Do Now',
    },
    {
      type: 'list',
      value: [
        'Review your updated interview performance metrics',
        'Apply for more interview opportunities',
        'Update your availability for future sessions',
        'Contact support if you have questions about this rating',
      ],
    },
    {
      type: 'cta',
      value: {
        text: 'View Your Dashboard',
        link: `${process.env.CLIENT_URL}/interviewer/dashboard`,
      },
    },
    {
      type: 'text',
      value:
        'If you believe this rating update was made in error, please contact our support team.',
    },
  ];

  const isEmailSent = await sendEmail({
    from: process.env.NODEMAILER_SMTP_EMAIL,
    to: interviewerRating.interviewer.email,
    subject: 'OptaHire - Rating Update',
    html: generateEmailTemplate({
      firstName: interviewerRating.interviewer.firstName,
      subject: 'Rating Update Notification',
      content: emailContent,
    }),
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Rating updated successfully but email could not be sent to the interviewer.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Rating updated successfully',
    interviewerRating: updatedInterviewerRating,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Delete interviewer rating
 *
 * @route   DELETE /api/interviewer-ratings/:id
 * @access  Private (Admin)
 *
 * @param   {string} id
 *
 * @returns {object} Success message
 * @throws  {Error} If rating not found
 * @throws  {Error} If unable to delete rating
 * @throws  {Error} If email could not be sent to the interviewer
 *
 */

const deleteInterviewerRating = asyncHandler(async (req, res) => {
  const interviewerRating = await InterviewerRating.findByPk(req.params.id, {
    include: [
      { model: User, as: 'interviewer' },
      { model: User, as: 'recruiter' },
      { model: Job, as: 'job' },
    ],
  });

  if (!interviewerRating) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Rating not found. Please check and try again.');
  }

  const deletedRating = await interviewerRating.destroy();

  if (!deletedRating) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Unable to delete rating. Please try again.');
  }

  const emailContent = [
    { type: 'heading', value: 'Rating Deletion Notification' },
    {
      type: 'text',
      value:
        'We wanted to inform you that an interview rating associated with your account has been removed from our system.',
    },
    {
      type: 'heading',
      value: 'Deleted Rating Details',
    },
    {
      type: 'list',
      value: [
        `Job Title: ${interviewerRating.job.title}`,
        `Rating: ${interviewerRating.rating}/5`,
        `Feedback: ${interviewerRating.feedback}`,
        `Company: ${interviewerRating.job.company}`,
        `Contract ID: ${interviewerRating.contractId}`,
      ],
    },
    {
      type: 'heading',
      value: 'What You Can Do Now',
    },
    {
      type: 'list',
      value: [
        'Review your current interview performance metrics',
        'Apply for more interview opportunities',
        'Update your availability for future sessions',
        'Contact support if you have questions about this deletion',
      ],
    },
    {
      type: 'cta',
      value: {
        text: 'View Your Dashboard',
        link: `${process.env.CLIENT_URL}/interviewer/dashboard`,
      },
    },
    {
      type: 'text',
      value:
        'If you believe this rating was removed in error, please contact our support team for assistance.',
    },
  ];

  const isEmailSent = await sendEmail({
    from: process.env.NODEMAILER_SMTP_EMAIL,
    to: interviewerRating.interviewer.email,
    subject: 'OptaHire - Rating Deletion Notification',
    html: generateEmailTemplate({
      firstName: interviewerRating.interviewer.firstName,
      subject: 'Rating Deletion Notification',
      content: emailContent,
    }),
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Rating deleted successfully but email could not be sent to the interviewer.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Rating deleted successfully',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Get interviewer ratings by job
 *
 * @route   GET /api/interviewer-ratings/job/:jobId
 * @access  Private (Recruiter, Admin, Interviewer)
 *
 * @param   {string} jobId
 *
 * @returns {object} Success message, count of ratings, and interviewer ratings
 * @throws  {Error} If no ratings found for the job
 *
 */

const getInterviewerRatingsByJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const interviewerRatings = await InterviewerRating.findAll({
    where: { jobId },
    include: [
      {
        model: User,
        as: 'interviewer',
        attributes: ['id', 'firstName', 'lastName', 'email'],
      },
      {
        model: User,
        as: 'recruiter',
        attributes: ['id', 'firstName', 'lastName', 'email'],
      },
      { model: Job, as: 'job', attributes: ['id', 'title', 'company'] },
      { model: Contract, as: 'contract', attributes: ['id'] },
    ],
  });

  if (!interviewerRatings || interviewerRatings.length === 0) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(
      'No interviewer ratings found for this job posting. Please check and try again.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Successfully retrieved ${interviewerRatings.length} ratings`,
    count: interviewerRatings.length,
    interviewerRatings,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Get interviewer ratings by contract
 *
 * @route   GET /api/interviewer-ratings/contract/:contractId
 * @access  Private (Recruiter, Admin, Interviewer)
 *
 * @param   {string} contractId
 *
 * @returns {object} Success message, count of ratings, and interviewer ratings
 * @throws  {Error} If no ratings found for the contract
 * @throws  {Error} If contract not found
 * @throws  {Error} If interviewer not found
 * @throws  {Error} If recruiter not found
 * @throws  {Error} If job posting not found
 */

const getInterviewerRatingsByContract = asyncHandler(async (req, res) => {
  const { contractId } = req.params;

  const interviewerRatings = await InterviewerRating.findAll({
    where: { contractId },
    include: [
      {
        model: User,
        as: 'interviewer',
        attributes: ['id', 'firstName', 'lastName', 'email'],
      },
      {
        model: User,
        as: 'recruiter',
        attributes: ['id', 'firstName', 'lastName', 'email'],
      },
      { model: Job, as: 'job', attributes: ['id', 'title', 'company'] },
      { model: Contract, as: 'contract', attributes: ['id'] },
    ],
  });

  if (!interviewerRatings || interviewerRatings.length === 0) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(
      'No interviewer ratings found for this contract. Please check and try again.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Successfully retrieved ${interviewerRatings.length} ratings`,
    count: interviewerRatings.length,
    interviewerRatings,
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  createInterviewerRating,
  getAllInterviewerRatings,
  getInterviewerRatingById,
  updateInterviewerRating,
  deleteInterviewerRating,
  getInterviewerRatingsByJob,
  getInterviewerRatingsByContract,
};
