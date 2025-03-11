const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');

const { User, Job, Application } = require('../models');

const sendEmail = require('../utils/nodemailer.utils');

/**
 * @desc Creates a new application
 *
 * @route POST /api/v1/applications
 * @access Private
 *
 * @param {Object} req - The request object containing the job ID.
 * @param {Object} res - The response object.
 * @returns {object} - A success message and the created application
 * @throws {Error} - If the candidate or job is not found, if the candidate has already applied for the job, or if the email could not be sent
 */

const createApplication = asyncHandler(async (req, res) => {
  const { jobId } = req.body;
  const candidateId = req.user.id;

  const candidate = await User.findByPk(candidateId);

  const job = await Job.findByPk(jobId, {
    include: [{ model: User, as: 'recruiter' }],
  });

  if (!candidate) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Candidate not found');
  }

  if (!job) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Job not found');
  }

  const existingApplication = await Application.findOne({
    where: { jobId, candidateId },
  });

  if (existingApplication) {
    res.status(StatusCodes.CONFLICT);
    throw new Error('You have already applied for this job');
  }

  const application = await Application.create({
    jobId,
    candidateId,
    status: 'applied',
    applicationDate: new Date(),
  });

  const isEmailSent = await sendEmail({
    from: process.env.SMTP_EMAIL,
    to: job.recruiter.email,
    subject: 'OptaHire - New Application Received',
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
                .app-details {
                  background-color: #f1f7ff;
                  font-size: 32px;
                  font-weight: bold;
                  color: #1a73e8;
                  text-align: center;
                  margin: 24px 0;
                  padding: 16px;
                  border-radius: 8px;
                  letter-spacing: 4px;
                }
                .message {
                  font-size: 16px;
                  line-height: 1.6;
                  color: #4a5568;
                  margin: 16px 0;
                }
                .warning {
                  font-size: 14px;
                  color: #e74c3c;
                  margin-top: 16px;
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
                <p class="message">Hello ${job.recruiter.name},</p>
                <p class="message">A new application has been received for the job <strong>${
                  job.title
                }</strong>.</p>
                <div class="app-details">
                  <p class="message">Candidate: ${candidate.name}</p>
                  <p class="message">Email: ${candidate.email}</p>
                  <p class="message">Application Date: ${
                    application.applicationDate
                  }</p>
                  <p class="message">Status: ${application.status}</p>
                </div>
                <p class="message">You can view the application by logging into your account.</p>
                <p class="message">Thank you for using OptaHire.</p>
                <p class="warning">This is an auto-generated email. Please do not reply.</p>
                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} OptaHire. All rights reserved.</p>
                  <p>Optimizing Your Recruitement Journey.</p>
                </div>
              </div>
            </body>
        </html>`,
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Email could not be sent');
  }

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Application submitted successfully',
    application,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Get all applications
 *
 * @route GET /api/v1/applications
 * @access Private/Admin
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {object} - A success message and the retrieved applications
 * @throws {Error} - If no applications are found
 */

const getAllApplications = asyncHandler(async (req, res) => {
  let applications;

  if (req.user.isCandidate) {
    applications = await Application.findAll({
      where: { candidateId: req.user.id },
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['title', 'category', 'location'],
        },
        {
          model: User,
          as: 'candidate',
          attributes: ['firstName', 'lastName', 'email'],
        },
      ],
    });
  } else if (req.user.isInterviewer) {
    applications = await Application.findAll({
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['title', 'category', 'location'],
        },
        {
          model: User,
          as: 'candidate',
          attributes: ['firstName', 'lastName', 'email'],
        },
      ],
      where: {
        status: {
          [Op.or]: ['shortlisted'],
        },
      },
    });
  } else if (req.user.isRecruiter) {
    applications = await Application.findAll({
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['title', 'category', 'location'],
        },
        {
          model: User,
          as: 'candidate',
          attributes: ['firstName', 'lastName', 'email'],
        },
      ],
      where: {
        '$job.recruiterId$': req.user.id,
      },
    });
  } else if (req.user.isAdmin) {
    applications = await Application.findAll({
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['title', 'category', 'location'],
        },
        {
          model: User,
          as: 'candidate',
          attributes: ['firstName', 'lastName', 'email'],
        },
      ],
    });
  }

  if (!applications || applications.length === 0) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('No applications found');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Applications retrieved successfully',
    count: applications.length,
    applications,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Get application by ID
 *
 * @route GET /api/v1/applications/:id
 * @access Private
 *
 * @param {Object} req - The request object containing the application ID.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */

const getApplicationById = asyncHandler(async (req, res) => {
  const application = await Application.findByPk(req.params.id, {
    include: [
      {
        model: Job,
        as: 'job',
        attributes: ['title', 'category', 'location'],
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
    throw new Error('Application not found');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Application retrieved successfully',
    application,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Update application
 *
 * @route PUT /api/v1/applications/:id
 * @access Private/Recruiter
 *
 * @param {Object} req - The request object containing the application ID.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 *
 */

const updateApplication = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const validStatuses = ['applied', 'shortlisted', 'rejected', 'hired'];

  if (!validStatuses.includes(status)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Invalid application status');
  }

  const application = await Application.findByPk(req.params.id, {
    include: [{ model: User, as: 'candidate' }, { model: Job }],
  });

  if (!application) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Application not found');
  }

  if (req.user.isRecruiter && application.job.recruiterId !== req.user.id) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error('You are not authorized to update this application');
  }

  application.status = status;

  const updatedApplication = await application.save();

  if (!updatedApplication) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Application could not be updated');
  }

  const isEmailSent = await sendEmail({
    from: process.env.SMTP_EMAIL,
    to: application.candidate.email,
    subject: 'OptaHire - Application Status Update',
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
                .app-details {
                  background-color: #f1f7ff;
                  font-size: 32px;
                  font-weight: bold;
                  color: #1a73e8;
                  text-align: center;
                  margin: 24px 0;
                  padding: 16px;
                  border-radius: 8px;
                  letter-spacing: 4px;
                }
                .message {
                  font-size: 16px;
                  line-height: 1.6;
                  color: #4a5568;
                  margin: 16px 0;
                }
                .warning {
                  font-size: 14px;
                  color: #e74c3c;
                  margin-top: 16px;
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
                <p class="message">Hello ${application.candidate.name},</p>
                <p class="message">Your application for the job <strong>${
                  application.job.title
                }</strong> has been updated.</p>
                <div class="app-details">${status.toUpperCase()}</div>
                <p class="message">You can check the status of your application by logging into your account.</p>
                <p class="message">Thank you for using OptaHire.</p>
                <p class="warning">This is an auto-generated email. Please do not reply.</p>
                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} OptaHire. All rights reserved.</p>
                  <p>Optimizing Your Recruitement Journey.</p>
                </div>
              </div>
            </body>
          </html>`,
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Email could not be sent');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Application updated successfully',
    application,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Delete application
 *
 * @route DELETE /api/v1/applications/:id
 * @access Private
 *
 * @param {Object} req - The request object containing the application ID.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 *
 */

const deleteApplication = asyncHandler(async (req, res) => {
  const application = await Application.findByPk(req.params.id);

  if (!application) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Application not found');
  }

  if (req.user.id !== application.candidateId && !req.user.isAdmin) {
    res.status(StatusCodes.FORBIDDEN);
    throw new Error('Not authorized to delete this application');
  }

  const deletedApplication = await application.destroy();

  if (!deletedApplication) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Application could not be deleted');
  }

  const isEmailSent = await sendEmail({
    from: process.env.SMTP_EMAIL,
    to: application.candidate.email,
    subject: 'OptaHire - Application Deleted',
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
                .app-details {
                  background-color: #f1f7ff;
                  font-size: 32px;
                  font-weight: bold;
                  color: #1a73e8;
                  text-align: center;
                  margin: 24px 0;
                  padding: 16px;
                  border-radius: 8px;
                  letter-spacing: 4px;
                }
                .message {
                  font-size: 16px;
                  line-height: 1.6;
                  color: #4a5568;
                  margin: 16px 0;
                }
                .warning {
                  font-size: 14px;
                  color: #e74c3c;
                  margin-top: 16px;
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
                <p class="message">Hello ${application.candidate.name},</p>
                <p class="message">Your application for the job <strong>${
                  application.job.title
                }</strong> has been deleted.</p>
                <p class="message">If you have any questions, please contact the recruiter.</p>
                <p class="message">Thank you for using OptaHire.</p>
                <p class="warning">This is an auto-generated email. Please do not reply.</p>
                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} OptaHire. All rights reserved.</p>
                  <p>Optimizing Your Recruitement Journey.</p>
                </div>
              </div>
            </body>
          </html>`,
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Email could not be sent');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Application deleted successfully',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Get job's applications
 *
 * @route GET /api/v1/applications/job/:jobId
 * @access Private/Recruiter
 *
 * @param {Object} req - The request object containing the job ID.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} - If the job is not found or if the user is not authorized to view applications for the job
 */

const getApplicationsByJobId = asyncHandler(async (req, res) => {
  const job = await Job.findByPk(req.params.jobId);

  if (!job) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Job not found');
  }

  if (req.user.isRecruiter && job.recruiterId !== req.user.id) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error('You are not authorized to view applications for this job');
  }

  const applications = await Application.findAll({
    where: { jobId: req.params.jobId },
    include: [
      {
        model: Job,
        as: 'job',
        attributes: ['title', 'category', 'location'],
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
    throw new Error('No applications found for this job');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Applications retrieved successfully',
    count: applications.length,
    applications,
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  getApplicationsByJobId,
};
