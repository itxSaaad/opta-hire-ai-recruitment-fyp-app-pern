const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const { Op, where } = require('sequelize');

const { Application, Contract, Job, User } = require('../models');

const {
  sendEmail,
  generateEmailTemplate,
} = require('../utils/nodemailer.utils');

/**
 * @desc Creates a new application
 *
 * @route POST /api/v1/applications
 * @access Private (Candidate)
 *
 * @param {Object} req - The request object containing the job ID.
 * @param {Object} res - The response object.
 *
 * @returns {Promise<void>}
 */

const createApplication = asyncHandler(async (req, res) => {
  const { jobId } = req.body;
  const candidateId = req.user.id;

  const [candidate, job] = await Promise.all([
    User.findByPk(candidateId),
    Job.findByPk(jobId, {
      include: { model: User, as: 'recruiter' },
    }),
  ]);

  if (!candidate) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(
      'Unable to locate your candidate profile. Please try again.'
    );
  }

  if (!job) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(
      'The job posting you are trying to apply for no longer exists.'
    );
  }

  const existingApplication = await Application.findOne({
    where: { jobId, candidateId },
  });

  if (existingApplication) {
    res.status(StatusCodes.CONFLICT);
    throw new Error(
      'You have already submitted an application for this position.'
    );
  }

  const application = await Application.create({
    jobId,
    candidateId,
    status: 'applied',
    applicationDate: new Date(),
  });

  const isEmailSent = await sendEmail({
    from: process.env.NODEMAILER_SMTP_EMAIL,
    to: job.recruiter.email,
    subject: 'OptaHire - New Application Received',
    html: generateEmailTemplate({
      firstName: job.recruiter.firstName,
      subject: 'OptaHire - New Application Received',
      content: [
        {
          type: 'heading',
          value: 'New Application Received!',
        },
        {
          type: 'text',
          value: `A new application has been received for the position of <strong>${job.title}</strong> at ${job.company}.`,
        },
        {
          type: 'heading',
          value: 'Application Details',
        },
        {
          type: 'list',
          value: [
            `Candidate: ${candidate.firstName} ${candidate.lastName}`,
            `Email: ${candidate.email}`,
            `Application Date: ${new Date(
              application.applicationDate
            ).toLocaleDateString()}`,
            `Status: ${
              application.status.charAt(0).toUpperCase() +
              application.status.slice(1)
            }`,
          ],
        },
        {
          type: 'cta',
          value: {
            text: 'Review Application',
            link: `${process.env.CLIENT_URL}/applications/${application.id}`,
          },
        },
        {
          type: 'text',
          value:
            'If you have any questions or need assistance, our support team is always ready to help.',
        },
      ],
    }),
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Application submitted successfully but notification emails could not be delivered.'
    );
  }

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Your application has been successfully submitted.',
    application,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Get all applications
 *
 * @route GET /api/v1/applications
 * @access Private
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 *
 * @returns {Promise<void>}
 */

const getAllApplications = asyncHandler(async (req, res) => {
  const { role, status, applicationDate, jobId, candidateId, interviewerId } =
    req.query;
  let whereClause = {};

  if (role) {
    switch (role) {
      case 'candidate':
        whereClause.candidateId = req.user.id;
        break;
      case 'interviewer':
        whereClause.status = { [Op.or]: ['shortlisted'] };
        break;
      case 'recruiter':
        whereClause['$job.recruiterId$'] = req.user.id;
        break;
    }
  }

  if (status) {
    whereClause.status = status;
  }

  if (applicationDate) {
    whereClause.applicationDate = {
      [Op.gte]: new Date(applicationDate),
    };
  }

  if (jobId) {
    whereClause.jobId = jobId;
  }

  if (candidateId) {
    whereClause.candidateId = candidateId;
  }

  if (interviewerId) {
    const contracts = await Contract.findAll({
      where: {
        interviewerId: interviewerId,
      },
      attributes: ['jobId'],
    });

    const jobIds = contracts.map((contract) => contract.jobId);

    if (jobIds.length > 0) {
      whereClause.jobId = {
        [Op.in]: jobIds,
      };
    } else {
      whereClause.jobId = {
        [Op.in]: [],
      };
    }
  }

  const applications = await Application.findAll({
    where: whereClause,
    include: [
      {
        model: Job,
        as: 'job',
        attributes: ['id', 'title', 'company', 'category', 'location'],
      },
      {
        model: User,
        as: 'candidate',
        attributes: ['id', 'firstName', 'lastName', 'email'],
      },
    ],
    order: [['applicationDate', 'DESC']],
  });

  if (!applications || applications.length === 0) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('No applications found matching the criteria.');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Applications retrieved successfully.',
    count: applications.length,
    applications,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Get application by ID
 *
 * @route GET /api/v1/applications/:id
 * @access Private (Recruiter, Admin)
 *
 * @param {Object} req - The request object containing the application ID.
 * @param {Object} res - The response object.
 *
 * @returns {Promise<void>}
 */

const getApplicationById = asyncHandler(async (req, res) => {
  const application = await Application.findByPk(req.params.id, {
    include: [
      {
        model: Job,
        as: 'job',
        attributes: ['title', 'company', 'category', 'location'],
      },
      {
        model: User,
        as: 'candidate',
        attributes: ['firstName', 'lastName', 'email'],
      },
    ],
  });

  if (!application) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(
      'No application found with the specified ID. Please try again.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Application details retrieved successfully.',
    application,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Get job's applications
 *
 * @route GET /api/v1/applications/job/:jobId
 * @access Private
 *
 * @param {Object} req - The request object containing the job ID.
 * @param {Object} res - The response object.
 *
 * @returns {Promise<void>}
 */

const getApplicationsByJobId = asyncHandler(async (req, res) => {
  const job = await Job.findByPk(req.params.jobId);

  if (!job) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('The requested job posting could not be found.');
  }

  const applications = await Application.findAll({
    where: { jobId: req.params.jobId },
    include: [
      {
        model: Job,
        as: 'job',
        attributes: ['title', 'company', 'category', 'location'],
      },
      {
        model: User,
        as: 'candidate',
        attributes: ['firstName', 'lastName', 'email'],
      },
    ],
  });

  if (!applications || applications.length === 0) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(
      'No applications have been submitted for this job posting yet.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Job applications retrieved successfully.',
    count: applications.length,
    applications,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Update application
 *
 * @route PUT /api/v1/applications/:id
 * @access Private (Recruiter, Admin)
 *
 * @param {Object} req - The request object containing the application ID.
 * @param {Object} res - The response object.
 *
 * @returns {Promise<void>}
 *
 */

const updateApplication = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const validStatuses = ['applied', 'shortlisted', 'rejected', 'hired'];

  if (!validStatuses.includes(status)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Please provide a valid application status.');
  }

  const application = await Application.findByPk(req.params.id, {
    include: [
      { model: User, as: 'candidate' },
      {
        model: Job,
        as: 'job',
        include: [{ model: User, as: 'recruiter' }],
      },
    ],
  });

  if (!application) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Unable to locate the specified application.');
  }

  if (req.user.isRecruiter && application.job.recruiterId !== req.user.id) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error('You do not have permission to update this application.');
  }

  application.status = status;

  const updatedApplication = await application.save();

  if (!updatedApplication) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Failed to update application status. Please try again.');
  }

  const emailContent = [
    {
      type: 'heading',
      value: 'Application Status Update',
    },
    {
      type: 'text',
      value: `The status of your application for the position of <strong>${application.job.title}</strong> has been updated to <strong>${application.status}</strong>.`,
    },
    {
      type: 'heading',
      value: 'Application Details',
    },
    {
      type: 'list',
      value: [
        `Job Title: ${application.job.title}`,
        `Job Location: ${application.job.location}`,
        `Application Date: ${new Date(
          application.applicationDate
        ).toLocaleDateString()}`,
        `Current Status: ${
          application.status.charAt(0).toUpperCase() +
          application.status.slice(1)
        }`,
      ],
    },
    {
      type: 'cta',
      value: {
        text: 'View Application',
        link: `${process.env.CLIENT_URL}/applications/${application.id}`,
      },
    },
    {
      type: 'text',
      value:
        'If you have any questions or need assistance, our support team is always ready to help.',
    },
  ];

  const isEmailSent = await Promise.all([
    sendEmail({
      from: process.env.NODEMAILER_SMTP_EMAIL,
      to: application.candidate.email,
      subject: 'OptaHire - Application Status Update',
      html: generateEmailTemplate({
        firstName: application.candidate.firstName,
        subject: 'Application Status Update',
        content: emailContent,
      }),
    }),
    sendEmail({
      from: process.env.NODEMAILER_SMTP_EMAIL,
      to: application.job.recruiter.email,
      subject: 'OptaHire - Application Status Update',
      html: generateEmailTemplate({
        firstName: application.job.recruiter.firstName,
        subject: 'Application Status Update',
        content: emailContent,
      }),
    }),
  ]);

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Application updated but notification emails could not be delivered.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Application status updated successfully.',
    application,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Delete application
 *
 * @route DELETE /api/v1/applications/:id
 * @access Private (Admin)
 *
 * @param {Object} req - The request object containing the application ID.
 * @param {Object} res - The response object.
 *
 * @returns {Promise<void>}
 */

const deleteApplication = asyncHandler(async (req, res) => {
  const application = await Application.findByPk(req.params.id);

  if (!application) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(
      'Application record not found. Please check and try again later.'
    );
  }

  await application.destroy();

  const [candidate, job] = await Promise.all([
    User.findByPk(application.candidateId),
    Job.findByPk(application.jobId),
  ]);

  const recruiter = await User.findByPk(job.recruiterId);

  const emailContent = [
    {
      type: 'heading',
      value: 'Application Record Deleted',
    },
    {
      type: 'text',
      value: `This application record has been permanently removed from the system.`,
    },
    {
      type: 'heading',
      value: 'Application Details',
    },
    {
      type: 'list',
      value: [
        `Job Title: ${job.title}`,
        `Company: ${job.company}`,
        `Candidate: ${candidate.firstName} ${candidate.lastName}`,
        `Application Date: ${new Date(
          application.applicationDate
        ).toLocaleString()}`,
        `Status: ${application.status}`,
      ],
    },
  ];

  const isEmailSent = await Promise.all([
    sendEmail({
      from: process.env.NODEMAILER_SMTP_EMAIL,
      to: recruiter.email,
      subject: 'OptaHire - Application Record Deleted',
      html: generateEmailTemplate({
        firstName: recruiter.firstName,
        subject: 'Application Record Deleted',
        content: emailContent,
      }),
    }),
    sendEmail({
      from: process.env.NODEMAILER_SMTP_EMAIL,
      to: candidate.email,
      subject: 'OptaHire - Application Record Deleted',
      html: generateEmailTemplate({
        firstName: candidate.firstName,
        subject: 'Application Record Deleted',
        content: emailContent,
      }),
    }),
  ]);

  if (!isEmailSent) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(
      'Application record deleted but email could not be delivered.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Application record has been successfully deleted',
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  createApplication,
  getAllApplications,
  getApplicationById,
  getApplicationsByJobId,
  updateApplication,
  deleteApplication,
};
