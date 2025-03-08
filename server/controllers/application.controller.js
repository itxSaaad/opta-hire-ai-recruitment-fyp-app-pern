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
            <style>
                body { font-family: 'Segoe UI', sans-serif; background-color: #f8f9fa; color: #2c3e50; }
                .container { max-width: 600px; margin: 20px auto; background-color: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 6px 12px rgba(0,0,0,0.08); }
                .header { font-size: 28px; font-weight: 600; text-align: center; color: #1a73e8; margin-bottom: 20px; }
                .app-details { background-color: #f1f7ff; font-size: 20px; font-weight: bold; color: #1a73e8; text-align: center; margin: 24px 0; padding: 16px; border-radius: 8px; }
                .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #edf2f7; color: #718096; font-size: 14px; }
            </style>
            <body>
                <div class="container">
                    <div class="header">OptaHire</div>
                    <p>Hello ${job.recruiter.name},</p>
                    <p>A new application has been received for the job <strong>${job.title}</strong>.</p>
                    <div class="app-details">
                        <p><strong>Candidate:</strong> ${candidate.name}</p><br/>
                        <p><strong>Email:</strong> ${candidate.email}</p><br/>
                        <p><strong>Job Title:</strong> ${job.title}</p><br/>
                        <p><strong>Company:</strong> ${job.company}</p><br/>
                        <p><strong>Location:</strong> ${job.location}</p><br/>
                        <p><strong>Salary:</strong> ${job.salary}</p><br/>
                        <p><strong>Application Date:</strong> ${application.applicationDate}</p>
                    </div>
                    <div class="footer">This is an automated email. Please do not reply to this email.</div>
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
          [Op.or]: ['shortlisted', 'accepted'],
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
                <style>
                    body { font-family: 'Segoe UI', sans-serif; background-color: #f8f9fa; color: #2c3e50; }
                    .container { max-width: 600px; margin: 20px auto; background-color: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 6px 12px rgba(0,0,0,0.08); }
                    .header { font-size: 28px; font-weight: 600; text-align: center; color: #1a73e8; margin-bottom: 20px; }
                    .app-details { background-color: #f1f7ff; font-size: 20px; font-weight: bold; color: #1a73e8; text-align: center; margin: 24px 0; padding: 16px; border-radius: 8px; }
                    .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #edf2f7; color: #718096; font-size: 14px; }
                </style>
                <body>
                    <div class="container">
                        <div class="header">OptaHire</div>
                        <p>Hello ${application.candidate.name},</p>
                        <p>Your application for the job <strong>${application.job.title}</strong> has been <strong>${status}</strong>.</p>
                        <div class="app-details">
                            <p><strong>Job Title:</strong> ${application.job.title}</p><br/>
                            <p><strong>Company:</strong> ${application.job.company}</p><br/>
                            <p><strong>Location:</strong> ${application.job.location}</p><br/>
                            <p><strong>Status:</strong> ${status}</p><br/>
                        </div>
                        <div class="footer">This is an automated email. Please do not reply to this email.</div>
                    </div>
                </body>
            </html>`,
  });

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
