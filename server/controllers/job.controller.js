const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');

const { User, Job } = require('../models');

const { validateString, validateArray } = require('../utils/validation.utils');
const {
  sendEmail,
  generateEmailTemplate,
} = require('../utils/nodemailer.utils');

/**
 * @desc Creates a new job.
 *
 * @route POST /api/v1/jobs
 * @access Private
 *
 * @param {Object} req - The request object containing the OTP.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the job could not be created.
 * @throws {Error} If the email could not be sent.
 */

const createJob = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    requirements,
    benefits,
    company,
    salaryRange,
    category,
    location,
  } = req.body;
  const recruiterId = req.user.id;

  const recruiter = await User.findByPk(recruiterId);

  if (!recruiter) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Recruiter not found');
  }

  if (
    !title ||
    !description ||
    !requirements ||
    !salaryRange ||
    !category ||
    !location
  ) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Please fill in all fields');
  }

  const validatedData = {
    title: title ? validateString(title, 'Title', 5, 100) : job.title,
    description: description
      ? validateString(description, 'Description', 10, 5000)
      : job.description,
    requirements: requirements
      ? JSON.stringify(validateArray(requirements, 'Requirements', 1, 20))
      : job.requirements,
    benefits: benefits
      ? JSON.stringify(validateArray(benefits, 'Benefits', 10, 2000))
      : job.benefits,
    company: company ? validateString(company, 'Company', 2, 100) : job.company,
    salaryRange: salaryRange
      ? validateString(salaryRange, 'Salary Range', 2, 100)
      : job.salaryRange,
    category: category
      ? validateString(category, 'Category', 2, 100)
      : job.category,
    location: location
      ? validateString(location, 'Location', 2, 100)
      : job.location,
    isClosed: false,
  };

  const job = await Job.create({
    ...validatedData,
    recruiterId,
  });

  if (!job) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Job could not be created');
  }

  const requirementsArrayParsed =
    typeof job.requirements === 'string'
      ? JSON.parse(job.requirements)
      : job.requirements;

  const requirementsArrayJoined = Array.isArray(requirementsArrayParsed)
    ? requirementsArrayParsed.join(', ')
    : requirementsArrayParsed;

  const benefitsArrayParsed =
    typeof job.benefits === 'string' ? JSON.parse(job.benefits) : job.benefits;

  const benefitsArrayJoined = Array.isArray(benefitsArrayParsed)
    ? benefitsArrayParsed.join(', ')
    : benefitsArrayParsed;

  const jobData = {
    ...job.dataValues,
    requirements: requirementsArrayJoined,
    benefits: benefitsArrayJoined,
  };

  const emailContent = [
    {
      type: 'text',
      value: 'You have successfully Created a new job on OptaHire.',
    },
    {
      type: 'heading',
      value: 'Job Details',
    },
    {
      type: 'list',
      value: [
        `Title: ${job.title}`,
        `Description: ${job.description}`,
        `Requirements: ${requirementsArrayJoined}`,
        `Benefits: ${benefitsArrayJoined}`,
        `Company: ${job.company}`,
        `Salary Range: ${job.salaryRange}`,
        `Category: ${job.category}`,
        `Location: ${job.location}`,
      ],
    },
    {
      type: 'text',
      value: 'Thank you for using OptaHire.',
    },
  ];

  const emailHtml = generateEmailTemplate({
    firstName: recruiter.firstName,
    subject: 'OptaHire - New Job Created',
    content: emailContent,
  });

  const isEmailSent = await sendEmail({
    from: process.env.SMTP_EMAIL,
    to: recruiter.email,
    subject: 'OptaHire - New Job Created',
    html: emailHtml,
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Email could not be sent.');
  }

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Job created successfully',
    job: jobData,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Gets all Job applications.
 *
 * @route GET /api/v1/jobs
 * @access Private AND Admin
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */

const getAllJobs = asyncHandler(async (req, res) => {
  const { search, category, location, company, salaryRange, isClosed } =
    req.query;
  let whereClause = {};

  if (search) {
    whereClause = {
      [Op.or]: [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { requirements: { [Op.iLike]: `%${search}%` } },
      ],
    };
  }

  if (category) {
    whereClause.category = { [Op.iLike]: `%${category}%` };
  }

  if (location) {
    whereClause.location = { [Op.iLike]: `%${location}%` };
  }

  if (company) {
    whereClause.company = { [Op.iLike]: `%${company}%` };
  }

  if (salaryRange) {
    whereClause.salaryRange = { [Op.iLike]: `%${salaryRange}%` };
  }

  if (isClosed) {
    whereClause.isClosed = isClosed;
  }

  const jobs = await Job.findAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: 'recruiter',
        attributes: ['firstName', 'lastName', 'email'],
      },
    ],
  });

  if (!jobs || jobs.length === 0) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('No jobs found');
  }

  const jobsData = jobs.map((job) => {
    const requirementsArrayParsed =
      typeof job.requirements === 'string'
        ? JSON.parse(job.requirements)
        : job.requirements;

    const requirementsArrayJoined = Array.isArray(requirementsArrayParsed)
      ? requirementsArrayParsed.join(', ')
      : requirementsArrayParsed;

    const benefitsArrayParsed =
      typeof job.benefits === 'string'
        ? JSON.parse(job.benefits)
        : job.benefits;

    const benefitsArrayJoined = Array.isArray(benefitsArrayParsed)
      ? benefitsArrayParsed.join(', ')
      : benefitsArrayParsed;

    return {
      ...job.dataValues,
      requirements: requirementsArrayJoined,
      benefits: benefitsArrayJoined,
    };
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Jobs retrieved successfully',
    count: jobs.length,
    jobs: jobsData,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Gets the job with the specified ID.
 *
 * @route GET /api/v1/jobs/:id
 * @access Private
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the job is not found.
 */

const getJobById = asyncHandler(async (req, res) => {
  const jobId = req.params.id;

  const job = await Job.findByPk(jobId, {
    include: [
      {
        model: User,
        as: 'recruiter',
        attributes: ['firstName', 'lastName', 'email'],
      },
    ],
  });

  if (!job) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Job not found');
  }

  const requirementsArrayParsed =
    typeof job.requirements === 'string'
      ? JSON.parse(job.requirements)
      : job.requirements;

  const requirementsArrayJoined = Array.isArray(requirementsArrayParsed)
    ? requirementsArrayParsed.join(', ')
    : requirementsArrayParsed;

  const benefitsArrayParsed =
    typeof job.benefits === 'string' ? JSON.parse(job.benefits) : job.benefits;

  const benefitsArrayJoined = Array.isArray(benefitsArrayParsed)
    ? benefitsArrayParsed.join(', ')
    : benefitsArrayParsed;

  const jobData = {
    ...job.dataValues,
    requirements: requirementsArrayJoined,
    benefits: benefitsArrayJoined,
  };

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Job retrieved successfully',
    job: jobData,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Updates the job with the specified ID.
 *
 * @route PATCH /api/v1/jobs/:id
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the job is not found.
 */

const updateJob = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    requirements,
    benefits,
    company,
    salaryRange,
    category,
    location,
    isClosed,
  } = req.body;
  const jobId = req.params.id;

  if (
    !title &&
    !description &&
    !requirements &&
    !benefits &&
    !company &&
    !salaryRange &&
    !category &&
    !location &&
    typeof isClosed === 'undefined'
  ) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Please fill in at least one field to update');
  }

  const job = await Job.findByPk(jobId, {
    include: [
      {
        model: User,
        as: 'recruiter',
        attributes: ['firstName', 'lastName', 'email'],
      },
    ],
  });

  if (!job) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Job not found');
  }

  const validatedData = {
    title: title ? validateString(title, 'Title', 5, 100) : job.title,
    description: description
      ? validateString(description, 'Description', 10, 5000)
      : job.description,
    requirements: requirements
      ? JSON.stringify(validateArray(requirements, 'Requirements', 1, 20))
      : job.requirements,
    benefits: benefits
      ? JSON.stringify(validateArray(benefits, 'Benefits', 10, 2000))
      : job.benefits,
    company: company ? validateString(company, 'Company', 2, 100) : job.company,
    salaryRange: salaryRange
      ? validateString(salaryRange, 'Salary Range', 2, 100)
      : job.salaryRange,
    category: category
      ? validateString(category, 'Category', 2, 100)
      : job.category,
    location: location
      ? validateString(location, 'Location', 2, 100)
      : job.location,
    isClosed: typeof isClosed !== 'undefined' ? isClosed : job.isClosed,
  };

  const updatedJob = await job.update(validatedData);

  if (!updatedJob) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Job could not be updated');
  }

  const requirementsArrayParsed =
    typeof updatedJob.requirements === 'string'
      ? JSON.parse(updatedJob.requirements)
      : updatedJob.requirements;

  const requirementsArrayJoined = Array.isArray(requirementsArrayParsed)
    ? requirementsArrayParsed.join(', ')
    : requirementsArrayParsed;

  const benefitsArrayParsed =
    typeof updatedJob.benefits === 'string'
      ? JSON.parse(updatedJob.benefits)
      : updatedJob.benefits;

  const benefitsArrayJoined = Array.isArray(benefitsArrayParsed)
    ? benefitsArrayParsed.join(', ')
    : benefitsArrayParsed;

  const jobData = {
    ...updatedJob.dataValues,
    requirements: requirementsArrayJoined,
    benefits: benefitsArrayJoined,
  };

  const emailContent = [
    {
      type: 'text',
      value: 'You have successfully Updated a job on OptaHire.',
    },
    {
      type: 'heading',
      value: 'Job Details',
    },
    {
      type: 'list',
      value: [
        `Title: ${updatedJob.title}`,
        `Description: ${updatedJob.description}`,
        `Requirements: ${requirementsArrayJoined}`,
        `Benefits: ${benefitsArrayJoined}`,
        `Company: ${updatedJob.company}`,
        `Salary Range: ${updatedJob.salaryRange}`,
        `Category: ${updatedJob.category}`,
        `Location: ${updatedJob.location}`,
        `Is Closed: ${updatedJob.isClosed}`,
      ],
    },
    {
      type: 'text',
      value: 'Thank you for using OptaHire.',
    },
  ];

  const emailHtml = generateEmailTemplate({
    firstName: job.recruiter.firstName,
    subject: 'OptaHire - Job Updated',
    content: emailContent,
  });

  const isEmailSent = await sendEmail({
    from: process.env.SMTP_EMAIL,
    to: job.recruiter.email,
    subject: 'OptaHire - Job Updated',
    html: emailHtml,
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Email could not be sent.');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Job updated successfully',
    job: jobData,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Deletes the job with the specified ID.
 *
 * @route DELETE /api/v1/jobs/:id
 * @access Private
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If the user is not found.
 */

const deleteJob = asyncHandler(async (req, res) => {
  const jobId = req.params.id;

  const job = await Job.findByPk(jobId, {
    include: [
      {
        model: User,
        as: 'recruiter',
        attributes: ['firstName', 'lastName', 'email'],
      },
    ],
  });

  if (!job) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Job not found');
  }

  const deletedJob = await job.destroy();

  if (!deletedJob) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Job could not be deleted');
  }

  const requirementsArrayParsed =
    typeof job.requirements === 'string'
      ? JSON.parse(job.requirements)
      : job.requirements;

  const requirementsArrayJoined = Array.isArray(requirementsArrayParsed)
    ? requirementsArrayParsed.join(', ')
    : requirementsArrayParsed;

  const benefitsArrayParsed =
    typeof updatedJob.benefits === 'string'
      ? JSON.parse(updatedJob.benefits)
      : updatedJob.benefits;

  const benefitsArrayJoined = Array.isArray(benefitsArrayParsed)
    ? benefitsArrayParsed.join(', ')
    : benefitsArrayParsed;

  const jobData = {
    ...job.dataValues,
    requirements: requirementsArrayJoined,
    benefits: benefitsArrayJoined,
  };

  const emailContent = [
    {
      type: 'text',
      value: 'You have successfully Deleted a job on OptaHire.',
    },
    {
      type: 'heading',
      value: 'Job Details',
    },
    {
      type: 'list',
      value: [
        `Title: ${job.title}`,
        `Description: ${job.description}`,
        `Requirements: ${requirementsArrayJoined}`,
        `Benefits: ${benefitsArrayJoined}`,
        `Company: ${job.company}`,
        `Salary Range: ${job.salaryRange}`,
        `Category: ${job.category}`,
        `Location: ${job.location}`,
      ],
    },
    {
      type: 'text',
      value: 'Thank you for using OptaHire.',
    },
  ];

  const emailHtml = generateEmailTemplate({
    firstName: job.recruiter.firstName,
    subject: 'OptaHire - Job Deleted',
    content: emailContent,
  });

  const isEmailSent = await sendEmail({
    from: process.env.SMTP_EMAIL,
    to: job.recruiter.email,
    subject: 'OptaHire - Job Deleted',
    html: emailHtml,
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Email could not be sent.');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Job deleted successfully',
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
};
