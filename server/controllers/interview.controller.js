const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');

const { User, Job, Interview, Application } = require('../models');

const {
  sendEmail,
  generateEmailTemplate,
} = require('../utils/nodemailer.utils');
const { validateString, validateArray } = require('../utils/validation.utils');
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
    throw new Error('Missing required fields');
  }

  if (new Date(scheduledTime) <= new Date()) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Scheduled time must be in the future');
  }

  if (interviewerId === candidateId) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Interviewer and candidate cannot be the same');
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
    throw new Error('Interviewer or candidate not found');
  }

  if (!job) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Job not found');
  }

  if (!application) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Application not found');
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
    throw new Error('Interview already scheduled at this time');
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
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Interview could not be scheduled');
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
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Email could not be sent');
  }

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Interview scheduled successfully',
    interview,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Get all interviews
 *
 * @route GET /api/interviews
 * @access Private (Interviewer, Candidate, Recruiter, Admin)
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 *
 * @returns {Object} Interviews
 * @throws {Error} If no interviews found
 * @throws {Error} If not authorized to view interviews
 */

const getAllInterviews = asyncHandler(async (req, res) => {
  let interviews;

  if (req.user.isInterviewer) {
    interviews = await Interview.findAll({
      where: { interviewerId: req.user.id },
      include: [
        { model: Job, as: 'job', attributes: ['title', 'description'] },
        { model: Application, as: 'application' },
        {
          model: User,
          as: 'candidate',
          attributes: ['firstName', 'lastName', 'email'],
        },
      ],
    });
  } else if (req.user.isCandidate) {
    interviews = await Interview.findAll({
      where: { candidateId: req.user.id },
      include: [
        { model: Job, as: 'job', attributes: ['title', 'description'] },
        { model: Application, as: 'application' },
        {
          model: User,
          as: 'interviewer',
          attributes: ['firstName', 'lastName', 'email'],
        },
      ],
    });
  } else if (req.user.isRecruiter) {
    const jobs = await Job.findAll({ where: { recruiterId: req.user.id } });
    const jobIds = jobs.map((job) => job.id);

    interviews = await Interview.findAll({
      where: { jobId: { [Op.in]: jobIds } },
      include: [
        { model: Job, as: 'job', attributes: ['title', 'description'] },
        { model: Application, as: 'application' },
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
    });
  } else if (req.user.isAdmin) {
    interviews = await Interview.findAll({
      include: [
        { model: Job, as: 'job', attributes: ['title', 'description'] },
        { model: Application, as: 'application' },
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
    });
  }

  if (!interviews || interviews.length === 0) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('No interviews found');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    interviews,
    count: interviews.length,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Get interview by ID
 *
 * @route GET /api/interviews/:id
 * @access Private (Interviewer, Candidate, Recruiter, Admin)
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
    throw new Error('Interview not found');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Interview found',
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
  const job = await Job.findByPk(req.params.jobId);

  if (!job) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Job not found');
  }

  let interviews;

  if (req.user.isInterviewer) {
    interviews = await Interview.findAll({
      where: { jobId: req.params.jobId, interviewerId: req.user.id },
      include: [
        { model: Job, as: 'job', attributes: ['title', 'description'] },
        { model: Application, as: 'application' },
        {
          model: User,
          as: 'candidate',
          attributes: ['firstName', 'lastName', 'email'],
        },
      ],
    });
  } else if (req.user.isRecruiter) {
    interviews = await Interview.findAll({
      where: { jobId: req.params.jobId },
      include: [
        { model: Job, as: 'job', attributes: ['title', 'description'] },
        { model: Application, as: 'application' },
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
    });
  } else if (req.user.isAdmin) {
    interviews = await Interview.findAll({
      where: { jobId: req.params.jobId },
      include: [
        { model: Job, as: 'job', attributes: ['title', 'description'] },
        { model: Application, as: 'application' },
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
    });
  }

  if (!interviews || interviews.length === 0) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('No interviews found for this job');
  }

  res.status(StatusCodes.OK).json({
    success: true,
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
    throw new Error('Interview not found');
  }

  const { scheduledTime, summary, status, rating } = req.body;

  if (status) {
    validateString(status, 'Status', 2, 50);

    if (!['scheduled', 'ongoing', 'completed', 'cancelled'].includes(status)) {
      res.status(StatusCodes.BAD_REQUEST);
      throw new Error('Invalid status value');
    }

    if (interview.status === 'completed' && status !== 'completed') {
      res.status(StatusCodes.BAD_REQUEST);
      throw new Error('Cannot change status of completed interview');
    }
    if (interview.status === 'cancelled' && status !== 'cancelled') {
      res.status(StatusCodes.BAD_REQUEST);
      throw new Error('Cannot change status of cancelled interview');
    }
  }

  if (scheduledTime && new Date(scheduledTime) <= new Date()) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Scheduled time must be in the future');
  }

  if (rating) {
    if (isNaN(rating) || rating < 0 || rating > 5) {
      res.status(StatusCodes.BAD_REQUEST);
      throw new Error('Rating must be a number between 0 and 5');
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
    throw new Error('Interview could not be updated');
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
        status ? `status has been changed to ${status}` : 'has been updated'
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
    throw new Error('Email could not be sent');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Interview updated successfully',
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
    throw new Error('Interview not found');
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
      value: `The Interview History has been deleted due to inactivity.`,
    },
    { type: 'heading', value: 'Deleted Interview Details' },
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
      subject: 'OptaHire - Interview Deleted',
      html: generateEmailTemplate({
        firstName: interviewer.firstName,
        subject: 'Interview Deleted',
        content: emailContent,
      }),
    }),
    sendEmail({
      to: recruiter.email,
      subject: 'OptaHire - Interview Deleted',
      html: generateEmailTemplate({
        firstName: recruiter.firstName,
        subject: 'Interview Deleted',
        content: emailContent,
      }),
    }),
    sendEmail({
      to: candidate.email,
      subject: 'OptaHire - Interview Deleted',
      html: generateEmailTemplate({
        firstName: candidate.firstName,
        subject: 'Interview Deleted',
        content: emailContent,
      }),
    }),
  ]);

  if (!isEmailSent) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Email could not be sent');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Interview deleted successfully',
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
