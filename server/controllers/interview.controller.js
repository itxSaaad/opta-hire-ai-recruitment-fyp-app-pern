const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');

const { User, Job, Interview, Application } = require('../models');

const {
  sendEmail,
  generateEmailTemplate,
} = require('../utils/nodemailer.utils');
const { validateString } = require('../utils/validation.utils');
const { generateRoomId, generateRemarks } = require('../utils/interview.utils');

/**
 * @desc Create a new interview
 *
 * @route POST /api/interviews
 * @access Private (Interviewer)
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 *
 * @body {String} roomId
 * @body {Date} scheduledTime
 * @body {Number} interviewerId
 * @body {Number} candidateId
 * @body {Number} jobId
 * @body {Number} applicationId
 * @body {String} remarks
 *
 * @returns {Object} Interview
 * @throws {Error} If required fields are missing
 * @throws {Error} If scheduled time is in the past
 * @throws {Error} If interviewer and candidate are the same
 * @throws {Error} If interviewer or candidate not found
 * @throws {Error} If job not found
 * @throws {Error} If chat room not found
 * @throws {Error} If interview already scheduled at this time
 * @throws {Error} If interview could not be scheduled
 */

const createInterview = asyncHandler(async (req, res) => {
  const interviewerId = req.user.id;
  const { scheduledTime, candidateId, jobId, applicationId } = req.body;

  if (!scheduledTime || !candidateId || !jobId || !applicationId || !roomId) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(
      'Please provide all required information to schedule the interview.'
    );
  }

  if (new Date(scheduledTime) <= new Date()) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Interview must be scheduled for a future date and time.');
  }

  if (interviewerId === candidateId) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('An interviewer cannot interview themselves.');
  }

  const [interviewer, candidate, recruiter, job, application] =
    await Promise.all([
      User.findByPk(interviewerId),
      User.findByPk(candidateId),
      User.findByPk(job.recruiterId),
      Job.findByPk(jobId),
      Application.findByPk(applicationId),
    ]);

  if (!interviewer || !candidate) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Could not find the specified interviewer or candidate.');
  }

  if (!job) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('The specified job position was not found.');
  }

  if (!application) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('The specified job application was not found.');
  }

  const existingInterview = await Interview.findOne({
    where: {
      [Op.or]: [
        { interviewerId, scheduledTime },
        { candidateId, scheduledTime },
        {
          [Op.and]: [
            {
              [Op.or]: [{ interviewerId }, { candidateId }],
            },
            {
              scheduledTime: {
                [Op.between]: [
                  new Date(new Date(scheduledTime).getTime() - 30 * 60000),
                  new Date(new Date(scheduledTime).getTime() + 30 * 60000),
                ],
              },
            },
          ],
        },
      ],
    },
  });

  if (existingInterview) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(
      'A conflicting interview is already scheduled for this time slot.'
    );
  }

  const roomId = generateRoomId();

  const remarks = generateRemarks(
    'scheduled',
    `${interviewer.firstName} ${interviewer.lastName}`,
    `${candidate.firstName} ${candidate.lastName}`,
    job.title
  );

  const interview = await Interview.create({
    roomId,
    scheduledTime,
    interviewerId,
    candidateId,
    jobId,
    applicationId,
    remarks,
    status: 'scheduled',
  });

  if (!interview) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Unable to schedule the interview. Please try again.');
  }

  const emailContent = [
    {
      type: 'text',
      value: `An interview has been scheduled between ${interviewer.firstName} ${interviewer.lastName} and ${candidate.firstName} ${candidate.lastName} for the position of ${job.title}.`,
    },
    { type: 'heading', value: 'Interview Details' },
    {
      type: 'list',
      value: [
        `Job Title: ${job.title}`,
        `Application ID: ${application.id}`,
        `Company: ${job.company}`,
        `Room ID: ${roomId}`,
        `Candidate: ${candidate.firstName} ${candidate.lastName}`,
        `Interviewer: ${interviewer.firstName} ${interviewer.lastName}`,
        `Scheduled Time: ${new Date(scheduledTime).toLocaleString()}`,
        `Remarks: ${remarks}`,
        `Interview Status: ${interview.status}`,
      ],
    },
    {
      type: 'text',
      value: `Please join the interview room at least 5 minutes before the scheduled time. Good luck!`,
    },
  ];

  const isEmailSent = await Promise.all([
    sendEmail({
      to: interviewer.email,
      subject: 'OptaHire - Interview Scheduled',
      html: generateEmailTemplate({
        firstName: interviewer.firstName,
        subject: 'Interview Scheduled',
        content: emailContent,
      }),
    }),
    sendEmail({
      to: recruiter.email,
      subject: 'OptaHire - Interview Scheduled',
      html: generateEmailTemplate({
        firstName: recruiter.firstName,
        subject: 'Interview Scheduled',
        content: emailContent,
      }),
    }),
    sendEmail({
      to: candidate.email,
      subject: 'OptaHire - Interview Scheduled',
      html: generateEmailTemplate({
        firstName: candidate.firstName,
        subject: 'Interview Scheduled',
        content: emailContent,
      }),
    }),
  ]);

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Interview scheduled but notification emails could not be delivered.'
    );
  }

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Interview has been successfully scheduled.',
    interview,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Get all interviews
 *
 * @route GET /api/interviews
 * @access Private
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 *
 * @returns {Object} Interviews
 * @throws {Error} If no interviews found
 * @throws {Error} If not authorized to view interviews
 */

const getAllInterviews = asyncHandler(async (req, res) => {
  const { role, status, scheduledTime, jobId, interviewerId, candidateId } =
    req.query;
  let whereClause = {};

  if (role) {
    switch (role) {
      case 'interviewer':
        whereClause.interviewerId = req.user.id;
        break;
      case 'candidate':
        whereClause.candidateId = req.user.id;
        break;
      case 'recruiter':
        whereClause['$job.recruiterId$'] = req.user.id;
        break;
    }
  }

  if (status) {
    if (!['scheduled', 'ongoing', 'completed', 'cancelled'].includes(status)) {
      res.status(StatusCodes.BAD_REQUEST);
      throw new Error('Invalid interview status provided.');
    }

    whereClause.status = status;
  }

  if (scheduledTime) {
    whereClause.scheduledTime = {
      [Op.gte]: new Date(scheduledTime),
    };
  }

  if (jobId) {
    whereClause.jobId = jobId;
  }

  if (interviewerId) {
    whereClause.interviewerId = interviewerId;
  }

  if (candidateId) {
    whereClause.candidateId = candidateId;
  }

  const interviews = await Interview.findAll({
    where: whereClause,
    include: [
      {
        model: Job,
        as: 'job',
        attributes: ['title', 'description'],
      },
      {
        model: Application,
        as: 'application',
      },
      {
        model: User,
        as: 'interviewer',
        attributes: ['firstName', 'lastName', 'email'],
      },
      {
        model: User,
        as: 'candidate',
        attributes: ['firstName', 'lastName', 'email'],
      },
    ],
    order: [['scheduledTime', 'DESC']],
  });

  if (!interviews || interviews.length === 0) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('No interviews found matching the criteria.');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Interviews retrieved successfully',
    interviews,
    count: interviews.length,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Get interview by ID
 *
 * @route GET /api/interviews/:id
 * @access Private
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 *
 * @returns {Object} Interview
 * @throws {Error} If interview not found
 * @throws {Error} If not authorized to view interview
 */

const getInterviewById = asyncHandler(async (req, res) => {
  const interview = await Interview.findByPk(req.params.id, {
    include: [
      {
        model: User,
        as: 'interviewer',
        attributes: ['id', 'firstName', 'lastName', 'email'],
      },
      {
        model: User,
        as: 'candidate',
        attributes: ['id', 'firstName', 'lastName', 'email'],
      },
      {
        model: Job,
        as: 'job',
        attributes: ['id', 'title'],
      },
    ],
  });

  if (!interview) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Interview details not found. Please check and try again.');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Interview details retrieved successfully',
    interview,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Get interviews by job ID
 *
 * @route GET /api/interviews/job/:jobId
 * @access Private (Interviewer, Recruiter, Admin)
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {String} req.params.jobId - Job ID
 *
 * @returns {Object} Interviews
 * @throws {Error} If job not found
 * @throws {Error} If no interviews found for this job
 * @throws {Error} If not authorized to view interviews
 */

const getInterviewsByJobId = asyncHandler(async (req, res) => {
  const { role, status, scheduledTime } = req.query;
  let whereClause = { jobId: req.params.jobId };

  if (role) {
    switch (role) {
      case 'interviewer':
        whereClause.interviewerId = req.user.id;
        break;
      case 'candidate':
        whereClause.candidateId = req.user.id;
        break;
      case 'recruiter':
        whereClause['$job.recruiterId$'] = req.user.id;
        break;
    }
  }

  if (status) {
    if (!['scheduled', 'ongoing', 'completed', 'cancelled'].includes(status)) {
      res.status(StatusCodes.BAD_REQUEST);
      throw new Error('Invalid interview status provided.');
    }

    whereClause.status = status;
  }

  if (scheduledTime) {
    whereClause.scheduledTime = {
      [Op.gte]: new Date(scheduledTime),
    };
  }

  const interviews = await Interview.findAll({
    where: whereClause,
    include: [
      {
        model: Job,
        as: 'job',
        attributes: ['title', 'description'],
      },
      {
        model: Application,
        as: 'application',
      },
      {
        model: User,
        as: 'interviewer',
        attributes: ['firstName', 'lastName', 'email'],
      },
      {
        model: User,
        as: 'candidate',
        attributes: ['firstName', 'lastName', 'email'],
      },
    ],
    order: [['scheduledTime', 'DESC']],
  });

  if (!interviews || interviews.length === 0) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('No interviews found for this job position.');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Interviews retrieved successfully',
    interviews,
    count: interviews.length,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Update an interview
 *
 * @route PUT /api/interviews/:id
 * @access Private (Interviewer, Admin)
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 *
 * @body {Date} scheduledTime
 * @body {String} summary
 * @body {String} status
 * @body {Number} rating
 *
 * @returns {Object} Interview
 * @throws {Error} If interview not found
 * @throws {Error} If scheduled time is in the past
 * @throws {Error} If room ID is required to complete an interview
 * @throws {Error} If interview could not be updated
 * @throws {Error} If email could not be sent
 */

const updateInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findByPk(req.params.id);

  if (!interview) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Interview not found. Please check and try again.');
  }

  const { scheduledTime, summary, status, rating } = req.body;

  if (status) {
    validateString(status, 'Status', 2, 50);

    if (!['scheduled', 'ongoing', 'completed', 'cancelled'].includes(status)) {
      res.status(StatusCodes.BAD_REQUEST);
      throw new Error('Invalid interview status provided.');
    }

    if (interview.status === 'completed' && status !== 'completed') {
      res.status(StatusCodes.BAD_REQUEST);
      throw new Error('Cannot modify a completed interview.');
    }
    if (interview.status === 'cancelled' && status !== 'cancelled') {
      res.status(StatusCodes.BAD_REQUEST);
      throw new Error('Cannot modify a cancelled interview.');
    }
  }

  if (scheduledTime && new Date(scheduledTime) <= new Date()) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Interview must be scheduled for a future date and time.');
  }

  if (rating) {
    if (isNaN(rating) || rating < 0 || rating > 5) {
      res.status(StatusCodes.BAD_REQUEST);
      throw new Error('Rating must be between 0 and 5 stars.');
    }
  }

  if (summary) {
    validateString(summary, 'Summary', 2, 2000);
  }

  const remarksContent = generateRemarks(
    status || interview.status,
    `${interview.interviewer.firstName} ${interview.interviewer.lastName}`,
    `${interview.candidate.firstName} ${interview.candidate.lastName}`,
    interview.job.title
  );

  const updatedInterview = await interview.update({
    scheduledTime: scheduledTime || interview.scheduledTime,
    summary: summary || interview.summary,
    remarks: remarksContent || interview.remarks,
    status: status || interview.status,
    rating: rating || interview.rating,
    callStartedAt: status === 'ongoing' ? new Date() : interview.callStartedAt,
    callEndedAt: status === 'completed' ? new Date() : interview.callEndedAt,
  });

  if (!updatedInterview) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Unable to update interview details. Please try again.');
  }

  const [interviewer, candidate, job] = await Promise.all([
    User.findByPk(updatedInterview.interviewerId),
    User.findByPk(updatedInterview.candidateId),
    Job.findByPk(updatedInterview.jobId),
  ]);

  const recruiter = await User.findByPk(job.recruiterId);

  const emailContent = [
    {
      type: 'text',
      value: `The interview ${
        status
          ? `status has been updated to ${status}`
          : 'details have been modified'
      }.`,
    },
    { type: 'heading', value: 'Updated Interview Details' },
    {
      type: 'list',
      value: [
        `Job Title: ${job.title}`,
        `Company: ${job.company}`,
        `Candidate: ${candidate.firstName} ${candidate.lastName}`,
        `Interviewer: ${interviewer.firstName} ${interviewer.lastName}`,
        `Scheduled Time: ${new Date(
          updatedInterview.scheduledTime
        ).toLocaleString()}`,
        `Remarks: ${updatedInterview.remarks}`,
        `Interview Status: ${updatedInterview.status}`,
      ],
    },
  ];

  const isEmailSent = await Promise.all([
    sendEmail({
      to: interviewer.email,
      subject: 'OptaHire - Interview Updated',
      html: generateEmailTemplate({
        firstName: interviewer.firstName,
        subject: 'Interview Updated',
        content: emailContent,
      }),
    }),
    sendEmail({
      to: recruiter.email,
      subject: 'OptaHire - Interview Updated',
      html: generateEmailTemplate({
        firstName: recruiter.firstName,
        subject: 'Interview Updated',
        content: emailContent,
      }),
    }),
    sendEmail({
      to: candidate.email,
      subject: 'OptaHire - Interview Updated',
      html: generateEmailTemplate({
        firstName: candidate.firstName,
        subject: 'Interview Updated',
        content: emailContent,
      }),
    }),
  ]);

  if (!isEmailSent) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(
      'Interview updated but notification emails could not be delivered.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Interview details updated successfully.',
    interview: updatedInterview,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Delete an interview
 *
 * @route DELETE /api/interviews/:id
 * @access Private (Admin)
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 *
 * @returns {Object} Message
 * @throws {Error} If interview not found
 * @throws {Error} If interview could not be deleted
 * @throws {Error} If email could not be sent
 */

const deleteInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findByPk(req.params.id);

  if (!interview) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(
      'Interview record not found. Please check and try again later.'
    );
  }

  await interview.destroy();

  const [interviewer, candidate, job] = await Promise.all([
    User.findByPk(interview.interviewerId),
    User.findByPk(interview.candidateId),
    Job.findByPk(interview.jobId),
  ]);

  const recruiter = await User.findByPk(job.recruiterId);

  const emailContent = [
    {
      type: 'text',
      value: `This interview record has been permanently removed from the system.`,
    },
    { type: 'heading', value: 'Interview Details' },
    {
      type: 'list',
      value: [
        `Job Title: ${job.title}`,
        `Company: ${job.company}`,
        `Candidate: ${candidate.firstName} ${candidate.lastName}`,
        `Interviewer: ${interviewer.firstName} ${interviewer.lastName}`,
        `Scheduled Time: ${new Date(interview.scheduledTime).toLocaleString()}`,
        `Remarks: ${interview.remarks}`,
        `Interview Status: ${interview.status}`,
      ],
    },
  ];

  const isEmailSent = await Promise.all([
    sendEmail({
      to: interviewer.email,
      subject: 'OptaHire - Interview Record Deleted',
      html: generateEmailTemplate({
        firstName: interviewer.firstName,
        subject: 'Interview Record Deleted',
        content: emailContent,
      }),
    }),
    sendEmail({
      to: recruiter.email,
      subject: 'OptaHire - Interview Record Deleted',
      html: generateEmailTemplate({
        firstName: recruiter.firstName,
        subject: 'Interview Record Deleted',
        content: emailContent,
      }),
    }),
    sendEmail({
      to: candidate.email,
      subject: 'OptaHire - Interview Record Deleted',
      html: generateEmailTemplate({
        firstName: candidate.firstName,
        subject: 'Interview Record Deleted',
        content: emailContent,
      }),
    }),
  ]);

  if (!isEmailSent) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(
      'Interview record deleted but email could not be delivered.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Interview record has been successfully deleted',
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  createInterview,
  getAllInterviews,
  getInterviewById,
  getInterviewsByJobId,
  updateInterview,
  deleteInterview,
};
