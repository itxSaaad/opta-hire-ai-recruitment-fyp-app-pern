const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');

const { User, Job } = require('../models');

const { validateString, validateArray } = require('../utils/validation.utils');
const {
  sendEmail,
  generateEmailTemplate,
} = require('../utils/nodemailer.utils');

const convertToArray = (value) => {
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  if (Array.isArray(value)) {
    return value;
  }
  return [];
};

/**
 * @desc Creates a new job.
 *
 * @route POST /api/v1/jobs
 * @access Private (Recruiter)
 *
 * @param {Object} req - The request object containing the OTP.
 * @param {Object} res - The response object.
 *
 * @returns {Promise<void>}
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
    throw new Error('Unable to find recruiter account. Please try again.');
  }

  if (
    !title ||
    !description ||
    !requirements ||
    !benefits ||
    !company ||
    !salaryRange ||
    !category ||
    !location
  ) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(
      'Please fill in all required fields to create a job posting.'
    );
  }

  const requirementsArray = convertToArray(requirements);
  const validatedRequirements = validateArray(
    res,
    requirementsArray,
    'Requirements',
    1,
    20
  );

  const benefitsArray = convertToArray(benefits);
  const validatedBenefits = validateArray(
    res,
    benefitsArray,
    'Benefits',
    1,
    20
  );

  const requirementsJson = JSON.stringify(validatedRequirements);
  const benefitsJson = JSON.stringify(validatedBenefits);

  if (requirementsJson.length < 50 || requirementsJson.length > 2000) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(
      'Requirements content must be between 50 and 2000 characters when formatted.'
    );
  }

  if (benefitsJson.length < 50 || benefitsJson.length > 2000) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(
      'Benefits content must be between 50 and 2000 characters when formatted.'
    );
  }

  const validatedData = {
    title: validateString(res, title, 'Title', 2, 100),
    description: validateString(res, description, 'Description', 50, 5000),
    requirements: requirementsJson,
    benefits: benefitsJson,
    company: validateString(res, company, 'Company', 2, 100),
    salaryRange: validateString(res, salaryRange, 'Salary Range', 2, 100),
    category: validateString(res, category, 'Category', 2, 100),
    location: validateString(res, location, 'Location', 2, 100),
    recruiterId,
    isClosed: false,
  };

  const job = await Job.create(validatedData);

  if (!job) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Unable to create job posting. Please try again.');
  }

  const requirementsForResponse = JSON.parse(job.requirements);
  const benefitsForResponse = JSON.parse(job.benefits);

  const requirementsDisplay = requirementsForResponse.join(', ');
  const benefitsDisplay = benefitsForResponse.join(', ');

  const jobData = {
    ...job.dataValues,
    requirements: requirementsDisplay,
    benefits: benefitsDisplay,
  };

  const isEmailSent = await sendEmail(res, {
    from: process.env.NODEMAILER_SMTP_EMAIL,
    to: recruiter.email,
    subject: 'OptaHire - New Job Created Successfully',
    html: generateEmailTemplate({
      firstName: recruiter.firstName,
      subject: 'OptaHire - New Job Created Successfully',
      content: [
        {
          type: 'heading',
          value: 'Job Creation Complete!',
        },
        {
          type: 'text',
          value:
            'Congratulations! Your job posting has been successfully created on OptaHire and is now live for candidates to view and apply.',
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
            `Requirements: ${requirementsDisplay}`,
            `Benefits: ${benefitsDisplay}`,
            `Company: ${job.company}`,
            `Salary Range: ${job.salaryRange}`,
            `Category: ${job.category}`,
            `Location: ${job.location}`,
          ],
        },
        {
          type: 'heading',
          value: 'Next Steps',
        },
        {
          type: 'list',
          value: [
            'Review applications as they come in',
            'Schedule interviews with promising candidates',
            'Update the job posting if needed',
            'Share the job on your professional networks',
          ],
        },
        {
          type: 'cta',
          value: {
            text: 'View Your Job Posting',
            link: `${process.env.CLIENT_URL}/jobs/${job.id}`,
          },
        },
        {
          type: 'text',
          value:
            'If you need any assistance with your job posting, our support team is here to help.',
        },
      ],
    }),
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Job created successfully but notification emails could not be delivered.'
    );
  }

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Job posting created successfully',
    job: jobData,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Gets all Job.
 *
 * @route GET /api/v1/jobs
 * @access Public
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 *
 * @returns {Promise<void>}
 */

const getAllJobs = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    location,
    company,
    salaryRange,
    isClosed,
    limit,
    recruiterId,
  } = req.query;
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

  if (category) whereClause.category = { [Op.iLike]: `%${category}%` };
  if (location) whereClause.location = { [Op.iLike]: `%${location}%` };
  if (company) whereClause.company = { [Op.iLike]: `%${company}%` };
  if (salaryRange) whereClause.salaryRange = { [Op.iLike]: `%${salaryRange}%` };
  if (isClosed) whereClause.isClosed = isClosed;
  if (recruiterId) whereClause.recruiterId = recruiterId;

  const jobs = await Job.findAll({
    where: whereClause,
    limit: limit ? parseInt(limit) : null,
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
    throw new Error(
      'No jobs match your search criteria. Try adjusting your filters.'
    );
  }

  const jobsData = jobs.map((job) => {
    const requirementsForResponse = JSON.parse(job.requirements);
    const benefitsForResponse = JSON.parse(job.benefits);

    const requirementsDisplay = requirementsForResponse.join(', ');
    const benefitsDisplay = benefitsForResponse.join(', ');

    return {
      ...job.dataValues,
      requirements: requirementsDisplay,
      benefits: benefitsDisplay,
    };
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Found ${jobs.length} opportunities matching your search`,
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
 *
 * @returns {Promise<void>}
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
    throw new Error('This job posting no longer exists or has been removed.');
  }

  const requirementsForResponse = JSON.parse(job.requirements);
  const benefitsForResponse = JSON.parse(job.benefits);

  const requirementsDisplay = requirementsForResponse.join(', ');
  const benefitsDisplay = benefitsForResponse.join(', ');

  const jobData = {
    ...job.dataValues,
    requirements: requirementsDisplay,
    benefits: benefitsDisplay,
  };

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Job details retrieved successfully',
    job: jobData,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Updates the job with the specified ID.
 *
 * @route PATCH /api/v1/jobs/:id
 * @access Private (Recruiter, Admin)
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 *
 * @returns {Promise<void>}
 */

const updateJobById = asyncHandler(async (req, res) => {
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
    throw new Error(
      'Please provide at least one field to update the job posting.'
    );
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
    throw new Error('Job posting not found. Please check and try again.');
  }

  const requirementsArray = convertToArray(requirements);
  const validatedRequirements = validateArray(
    res,
    requirementsArray,
    'Requirements',
    1,
    20
  );

  const benefitsArray = convertToArray(benefits);
  const validatedBenefits = validateArray(
    res,
    benefitsArray,
    'Benefits',
    1,
    20
  );

  const requirementsJson = JSON.stringify(validatedRequirements);
  const benefitsJson = JSON.stringify(validatedBenefits);

  if (requirementsJson.length < 50 || requirementsJson.length > 2000) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(
      'Requirements content must be between 50 and 2000 characters when formatted.'
    );
  }

  if (benefitsJson.length < 50 || benefitsJson.length > 2000) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(
      'Benefits content must be between 50 and 2000 characters when formatted.'
    );
  }

  const validatedData = {
    title: title ? validateString(res, title, 'Title', 2, 100) : job.title,
    description: description
      ? validateString(res, description, 'Description', 50, 5000)
      : job.description,
    requirements: requirementsJson,
    benefits: benefitsJson,
    company: company
      ? validateString(res, company, 'Company', 2, 100)
      : job.company,
    salaryRange: salaryRange
      ? validateString(res, salaryRange, 'Salary Range', 2, 100)
      : job.salaryRange,
    category: category
      ? validateString(res, category, 'Category', 2, 100)
      : job.category,
    location: location
      ? validateString(res, location, 'Location', 2, 100)
      : job.location,
    isClosed: typeof isClosed === 'undefined' ? job.isClosed : isClosed,
  };

  const updatedJob = await job.update(validatedData);

  if (!updatedJob) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Unable to update job posting. Please try again.');
  }

  if (!job.isClosed && updatedJob.isClosed === true && req.user.isRecruiter) {
    axios
      .post(
        `${process.env.SERVER_URL || 'http://localhost:5000'}/api/v1/ai/shortlist/${jobId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}`,
          },
        }
      )
      .catch((error) => {
        console.error(
          'Failed to trigger automatic candidate shortlisting:',
          error.message
        );
      });
  }

  const requirementsForResponse = JSON.parse(updatedJob.requirements);
  const benefitsForResponse = JSON.parse(updatedJob.benefits);

  const requirementsDisplay = requirementsForResponse.join(', ');
  const benefitsDisplay = benefitsForResponse.join(', ');

  const jobData = {
    ...updatedJob.dataValues,
    requirements: requirementsDisplay,
    benefits: benefitsDisplay,
  };

  const isEmailSent = await sendEmail(res, {
    from: process.env.NODEMAILER_SMTP_EMAIL,
    to: job.recruiter.email,
    subject: 'OptaHire - Job Updated',
    html: generateEmailTemplate({
      firstName: job.recruiter.firstName,
      subject: 'OptaHire - Job Updated',
      content: [
        {
          type: 'heading',
          value: 'Job Update Complete!',
        },
        {
          type: 'text',
          value:
            'Your job posting has been successfully updated on OptaHire and is now live for candidates to view and apply.',
        },
        {
          type: 'heading',
          value: 'Updated Job Details',
        },
        {
          type: 'list',
          value: [
            `Title: ${updatedJob.title}`,
            `Description: ${updatedJob.description}`,
            `Requirements: ${requirementsDisplay}`,
            `Benefits: ${benefitsDisplay}`,
            `Company: ${updatedJob.company}`,
            `Salary Range: ${updatedJob.salaryRange}`,
            `Category: ${updatedJob.category}`,
            `Location: ${updatedJob.location}`,
          ],
        },
        {
          type: 'heading',
          value: 'Next Steps',
        },
        {
          type: 'list',
          value: [
            'Review applications as they come in',
            'Schedule interviews with promising candidates',
            'Update the job posting if needed',
            'Share the job on your professional networks',
          ],
        },
        {
          type: 'cta',
          value: {
            text: 'View Your Job Posting',
            link: `${process.env.CLIENT_URL}/jobs/${updatedJob.id}`,
          },
        },
        {
          type: 'text',
          value:
            'If you need any assistance with your job posting, our support team is here to help.',
        },
      ],
    }),
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Job updated successfully but notification emails could not be delivered.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Job posting updated successfully',
    job: jobData,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Deletes the job with the specified ID.
 *
 * @route DELETE /api/v1/jobs/:id
 * @access Private (Admin)
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 *
 * @returns {Promise<void>}
 */

const deleteJobById = asyncHandler(async (req, res) => {
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
    throw new Error('Job posting not found. Please check and try again.');
  }

  const deletedJob = await job.destroy();

  if (!deletedJob) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Unable to delete job posting. Please try again.');
  }

  const requirementsForResponse = JSON.parse(deletedJob.requirements);
  const benefitsForResponse = JSON.parse(deletedJob.benefits);

  const requirementsDisplay = requirementsForResponse.join(', ');
  const benefitsDisplay = benefitsForResponse.join(', ');

  const isEmailSent = await sendEmail(res, {
    from: process.env.NODEMAILER_SMTP_EMAIL,
    to: job.recruiter.email,
    subject: 'OptaHire - Job Deleted',
    html: generateEmailTemplate({
      firstName: job.recruiter.firstName,
      subject: 'OptaHire - Job Deleted',
      content: [
        {
          type: 'heading',
          value: 'Job Deletion Complete!',
        },
        {
          type: 'text',
          value:
            'Your job posting has been successfully deleted from OptaHire. If you did not initiate this action, please contact our support team immediately.',
        },
        {
          type: 'heading',
          value: 'Deleted Job Details',
        },
        {
          type: 'list',
          value: [
            `Title: ${job.title}`,
            `Description: ${job.description}`,
            `Requirements: ${requirementsDisplay}`,
            `Benefits: ${benefitsDisplay}`,
            `Company: ${job.company}`,
            `Salary Range: ${job.salaryRange}`,
            `Category: ${job.category}`,
            `Location: ${job.location}`,
          ],
        },
        {
          type: 'text',
          value:
            'If you did not delete this job posting, please contact our support team immediately to secure your account.',
        },
      ],
    }),
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Job deleted successfully but notification emails could not be delivered.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Job posting deleted successfully',
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJobById,
  deleteJobById,
};
