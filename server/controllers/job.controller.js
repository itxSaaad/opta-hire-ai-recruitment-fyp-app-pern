const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');

const { User, Job } = require('../models');

const { validateString, validateArray } = require('../utils/validation.utils');
const sendEmail = require('../utils/nodemailer.utils');

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
  const { title, description, requirements, salaryRange, category, location } =
    req.body;

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
    title: title ? validateString(title, 'Title', 5, 100) : null,
    description: description
      ? validateString(description, 'Description', 10, 5000)
      : null,
    requirements: requirements
      ? JSON.stringify(validateArray(requirements, 'Requirements', 1, 20))
      : null,
    salaryRange: salaryRange
      ? validateString(salaryRange, 'Salary Range', 2, 100)
      : null,
    category: category ? validateString(category, 'Category', 2, 100) : null,
    location: location ? validateString(location, 'Location', 2, 100) : null,
  };

  const job = await Job.create({
    ...validatedData,
    recruiterId: recruiterId,
  });

  if (!job) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Job could not be created');
  }

  const requirementsArray =
    typeof job.requirements === 'string'
      ? JSON.parse(job.requirements)
      : job.requirements;

  const requirementsJoined = Array.isArray(requirementsArray)
    ? requirementsArray.join(', ')
    : requirementsArray;

  const jobData = {
    ...job.dataValues,
    requirements: requirementsJoined,
  };

  const isEmailSent = await sendEmail({
    from: process.env.SMTP_EMAIL,
    to: jobData.recruiter.email,
    subject: 'OptaHire - New Job Created',
    html: `<html>
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
            .message {
              font-size: 16px;
              line-height: 1.6;
              color: #4a5568;
              margin: 16px 0;
            }
            .job-details {
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
            .footer {
              text-align: center;
              margin-top: 32px;
              padding-top: 16px;
              border-top: 1px solid #edf2f7;
              color: #718096;
              font-size: 14px;
            }
          </style>
          <body>
            <div class="container">
              <div class="logo">
                <h1 class="header">OptaHire</h1>
              </div>
              <p class="message">Hello ${jobData.recruiter.firstName},</p>
              <p class="message">You have successfully created a new job listing on OptaHire.</p>
              <div class="job-details">
                <strong>Job Title:</strong> ${jobData.title}<br />
                <strong>Job Description:</strong> ${jobData.description}<br />
                <strong>Job Requirements:</strong> ${
                  jobData.requirements || 'No requirements specified'
                }<br />
                <strong>Job Salary Range:</strong> ${jobData.salaryRange}<br />
                <strong>Job Category:</strong> ${jobData.category}<br />
                <strong>Job Location:</strong> ${jobData.location}<br />
              </div>
              <p class="message">Thank you for using OptaHire.</p>
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
  const { query } = req.query;

  let whereClause = {};

  if (query) {
    whereClause = {
      [Op.or]: [
        { title: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } },
        { category: { [Op.like]: `%${query}%` } },
        { location: { [Op.like]: `%${query}%` } },
      ],
    };
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
    const requirementsArray =
      typeof job.requirements === 'string'
        ? JSON.parse(job.requirements)
        : job.requirements;

    const requirementsJoined = Array.isArray(requirementsArray)
      ? requirementsArray.join(', ')
      : requirementsArray;

    return {
      ...job.dataValues,
      requirements: requirementsJoined,
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

  const requirementsArray =
    typeof job.requirements === 'string'
      ? JSON.parse(job.requirements)
      : job.requirements;

  const requirementsJoined = Array.isArray(requirementsArray)
    ? requirementsArray.join(', ')
    : requirementsArray;

  const jobData = {
    ...job.dataValues,
    requirements: requirementsJoined,
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
  const jobId = req.params.id;

  const { title, description, requirements, salaryRange, category, location } =
    req.body;

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
    title: title ? validateString(title, 'Title', 5, 100) : null,
    description: description
      ? validateString(description, 'Description', 10, 5000)
      : null,
    requirements: requirements
      ? JSON.stringify(validateArray(requirements, 'Requirements', 1, 20))
      : null,
    salaryRange: salaryRange
      ? validateString(salaryRange, 'Salary Range', 2, 100)
      : null,
    category: category ? validateString(category, 'Category', 2, 100) : null,
    location: location ? validateString(location, 'Location', 2, 100) : null,
  };

  const updatedJob = await job.update(validatedData);

  if (!updatedJob) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Job could not be updated');
  }

  const requirementsArray =
    typeof updatedJob.requirements === 'string'
      ? JSON.parse(updatedJob.requirements)
      : updatedJob.requirements;

  const requirementsJoined = Array.isArray(requirementsArray)
    ? requirementsArray.join(', ')
    : requirementsArray;

  const isEmailSent = await sendEmail({
    from: process.env.SMTP_EMAIL,
    to: job.recruiter.email,
    subject: 'OptaHire - Job Updated',
    html: `<html>
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
            .message {
              font-size: 16px;
              line-height: 1.6;
              color: #4a5568;
              margin: 16px 0;
            }
            .job-details {
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
            .footer {
              text-align: center;
              margin-top: 32px;
              padding-top: 16px;
              border-top: 1px solid #edf2f7;
              color: #718096;
              font-size: 14px;
            }
        </style>
          <body>
            <div class="container">
              <div class="logo">
                <h1 class="header">OptaHire</h1>
              </div>
              <p class="message">Hello ${job.recruiter.firstName},</p>
              <p class="message">Your job listing on OptaHire has been updated.</p>
              <div class="job-details">
                <strong>Job Title:</strong> ${updatedJob.title}<br />
                <strong>Job Description:</strong> ${
                  updatedJob.description
                }<br />
                <strong>Job Requirements:</strong> ${
                  requirementsJoined || 'No requirements specified'
                }<br />
                <strong>Job Salary Range:</strong> ${
                  updatedJob.salaryRange
                }<br />
                <strong>Job Category:</strong> ${updatedJob.category}<br />
                <strong>Job Location:</strong> ${updatedJob.location}<br />
              </div>
              <p class="message">Thank you for using OptaHire.</p>
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
    throw new Error('Email could not be sent.');
  }

  const jobData = {
    ...updatedJob.dataValues,
    requirements: requirementsJoined,
  };

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

  const requirementsArray =
    typeof job.requirements === 'string'
      ? JSON.parse(job.requirements)
      : job.requirements;

  const requirementsJoined = Array.isArray(requirementsArray)
    ? requirementsArray.join(', ')
    : requirementsArray;

  const jobData = {
    ...job.dataValues,
    requirements: requirementsJoined,
  };

  const isEmailSent = await sendEmail({
    from: process.env.SMTP_EMAIL,
    to: job.recruiter.email,
    subject: 'OptaHire - Job Deleted',
    html: `<html>
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
            .message {
              font-size: 16px;
              line-height: 1.6;
              color: #4a5568;
              margin: 16px 0;
            }
            .job-details {
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
            .footer {
              text-align: center;
              margin-top: 32px;
              padding-top: 16px;
              border-top: 1px solid #edf2f7;
              color: #718096;
              font-size: 14px;
            }
          </style>
          <body>
            <div class="container">
              <div class="logo">
                <h1 class="header">OptaHire</h1>
              </div>
              <p class="message">Hello ${job.recruiter.firstName},</p>
              <p class="message">Your job listing on OptaHire has been deleted.</p>
              <div class="job-details">
                <strong>Job Title:</strong> ${jobData.title}<br />
                <strong>Job Description:</strong> ${jobData.description}<br />
                <strong>Job Requirements:</strong> ${
                  jobData.requirements || 'No requirements specified'
                }<br />
                <strong>Job Salary Range:</strong> ${jobData.salaryRange}<br />
                <strong>Job Category:</strong> ${jobData.category}<br />  
                <strong>Job Location:</strong> ${jobData.location}<br />
              </div>
              <p class="message">Thank you for using OptaHire.</p>  
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
