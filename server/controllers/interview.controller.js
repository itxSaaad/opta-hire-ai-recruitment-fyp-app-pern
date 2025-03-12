const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');

const { User, Job, Interview, ChatRoom, Message } = require('../models');

const {
  sendEmail,
  generateEmailTemplate,
} = require('../utils/nodemailer.utils');

const generateRoomId = (length = 12) => {
  const timestamp = Date.now().toString(36);
  const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomPart = Array.from({ length: 6 }, () =>
    randomChars.charAt(Math.floor(Math.random() * randomChars.length))
  ).join('');

  return `${timestamp.slice(-4)}-${randomPart.slice(0, 4)}-${randomPart.slice(
    4
  )}`;
};

/**
 * @desc Create a new interview
 *
 * @route POST /api/interviews
 * @access Private (Interviewer, Candidate)
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
  const {
    roomId,
    scheduledTime,
    interviewerId,
    candidateId,
    jobId,
    applicationId,
    remarks,
  } = req.body;

  if (
    !roomId ||
    !scheduledTime ||
    !interviewerId ||
    !candidateId ||
    !jobId ||
    !applicationId
  ) {
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

  const interviewer = await User.findByPk(interviewerId);
  const candidate = await User.findByPk(candidateId);

  if (!interviewer || !candidate) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Interviewer or candidate not found');
  }

  const job = await Job.findByPk(jobId);

  if (!job) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Job not found');
  }

  const chatRoom = await ChatRoom.findByPk(roomId);

  if (!chatRoom) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Chat room not found');
  }

  const existingInterview = await Interview.findOne({
    where: {
      [Op.or]: [
        { interviewerId, scheduledTime },
        { candidateId, scheduledTime },
      ],
    },
  });

  if (existingInterview) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Interview already scheduled at this time');
  }

  const room = generateRoomId();

  const interview = await Interview.create({
    roomId: room,
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

  const interviewerEmailContent = [
    {
      type: 'text',
      value: `An interview has been scheduled with ${candidate.firstName} ${candidate.lastName} for the job ${job.title}.`,
    },
    { type: 'heading', value: 'Interview Details' },
    {
      type: 'list',
      value: [
        `Date and Time: ${new Date(scheduledTime).toLocaleString()}`,
        `Job Title: ${job.title}`,
        `Candidate: ${candidate.firstName} ${candidate.lastName}`,
        `Room ID: ${room}`,
      ],
    },
  ];

  const candidateEmailContent = [
    {
      type: 'text',
      value: `An interview has been scheduled with ${interviewer.firstName} ${interviewer.lastName} for the job ${job.title}.`,
    },
    { type: 'heading', value: 'Interview Details' },
    {
      type: 'list',
      value: [
        `Date and Time: ${new Date(scheduledTime).toLocaleString()}`,
        `Job Title: ${job.title}`,
        `Interviewer: ${interviewer.firstName} ${interviewer.lastName}`,
        `Room ID: ${room}`,
      ],
    },
  ];

  const isEmailSent = await Promise.all([
    sendEmail({
      to: interviewer.email,
      subject: 'OptaHire - Interview Scheduled',
      html: generateEmailTemplate({
        firstName: interviewer.firstName,
        subject: 'Interview Scheduled',
        content: interviewerEmailContent,
      }),
    }),
    sendEmail({
      to: candidate.email,
      subject: 'OptaHire - Interview Scheduled',
      html: generateEmailTemplate({
        firstName: candidate.firstName,
        subject: 'Interview Scheduled',
        content: candidateEmailContent,
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
 * @access Private (Interviewer, Candidate, Admin)
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 *
 * @returns {Object} Interviews
 * @throws {Error} If no interviews found
 * @throws {Error} If not authorized to view interviews
 */

const getInterviews = asyncHandler(async (req, res) => {
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
  } else {
    res.status(StatusCodes.FORBIDDEN);
    throw new Error('Not authorized to view interviews');
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
 * @access Private (Interviewer, Candidate, Admin)
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
 * @desc Update an interview
 *
 * @route PUT /api/interviews/:id
 * @access Private (Interviewer, Admin)
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 *
 * @body {String} roomId
 * @body {Date} scheduledTime
 * @body {String} remarks
 * @body {String} status
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

  const { roomId, scheduledTime, remarks, status } = req.body;

  if (new Date(scheduledTime) <= new Date()) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Scheduled time must be in the future');
  }

  if (status === 'completed' && !roomId) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Room ID is required to complete an interview');
  }

  const updatedInterview = await interview.update({
    roomId: roomId || interview.roomId,
    scheduledTime: scheduledTime || interview.scheduledTime,
    remarks: remarks || interview.remarks,
    status: status || interview.status,
  });

  if (!updatedInterview) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Interview could not be updated');
  }

  const [interviewer, candidate] = await Promise.all([
    User.findByPk(updatedInterview.interviewerId),
    User.findByPk(updatedInterview.candidateId),
  ]);

  const job = await Job.findByPk(updatedInterview.jobId);

  const isEmailSent = await Promise.all([
    sendEmail({
      to: interviewer.email,
      subject: 'OptaHire - Interview Updated',
      html: generateEmailTemplate({
        firstName: interviewer.firstName,
        subject: 'Interview Updated',
        content: [
          {
            type: 'text',
            value: `The interview with ${candidate.firstName} ${candidate.lastName} for the position ${job.title} has been updated.`,
          },
          { type: 'heading', value: 'Updated Interview Details' },
          {
            type: 'list',
            value: [
              `Date and Time: ${new Date(
                updatedInterview.scheduledTime
              ).toLocaleString()}`,
              `Job Title: ${job.title}`,
              `Status: ${updatedInterview.status}`,
              `Room ID: ${updatedInterview.roomId}`,
              `Remarks: ${updatedInterview.remarks || 'N/A'}`,
            ],
          },
        ],
      }),
    }),
    sendEmail({
      to: candidate.email,
      subject: 'OptaHire - Interview Updated',
      html: generateEmailTemplate({
        firstName: candidate.firstName,
        subject: 'Interview Updated',
        content: [
          {
            type: 'text',
            value: `Your interview with ${interviewer.firstName} ${interviewer.lastName} for the position ${job.title} has been updated.`,
          },
          { type: 'heading', value: 'Updated Interview Details' },
          {
            type: 'list',
            value: [
              `Date and Time: ${new Date(
                updatedInterview.scheduledTime
              ).toLocaleString()}`,
              `Job Title: ${job.title}`,
              `Status: ${updatedInterview.status}`,
              `Room ID: ${updatedInterview.roomId}`,
              `Remarks: ${updatedInterview.remarks || 'N/A'}`,
            ],
          },
        ],
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
 * @access Private (Interviewer, Admin)
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

  const isDeleted = await interview.destroy();

  if (!isDeleted) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Interview could not be deleted');
  }

  const [interviewer, candidate] = await Promise.all([
    User.findByPk(interview.interviewerId),
    User.findByPk(interview.candidateId),
  ]);

  const job = await Job.findByPk(interview.jobId);

  const isEmailSent = await Promise.all([
    sendEmail({
      to: interviewer.email,
      subject: 'OptaHire - Interview Cancelled',
      html: generateEmailTemplate({
        firstName: interviewer.firstName,
        subject: 'Interview Cancelled',
        content: [
          {
            type: 'text',
            value: `The interview with ${candidate.firstName} ${candidate.lastName} for the position ${job.title} has been cancelled.`,
          },
          { type: 'heading', value: 'Cancelled Interview Details' },
          {
            type: 'list',
            value: [
              `Date and Time: ${new Date(
                interview.scheduledTime
              ).toLocaleString()}`,
              `Job Title: ${job.title}`,
              `Status: Cancelled`,
              `Remarks: ${interview.remarks || 'N/A'}`,
            ],
          },
        ],
      }),
    }),
    sendEmail({
      to: candidate.email,
      subject: 'OptaHire - Interview Cancelled',
      html: generateEmailTemplate({
        firstName: candidate.firstName,
        subject: 'Interview Cancelled',
        content: [
          {
            type: 'text',
            value: `Your interview with ${interviewer.firstName} ${interviewer.lastName} for the position ${job.title} has been cancelled.`,
          },
          { type: 'heading', value: 'Cancelled Interview Details' },
          {
            type: 'list',
            value: [
              `Date and Time: ${new Date(
                interview.scheduledTime
              ).toLocaleString()}`,
              `Job Title: ${job.title}`,
              `Status: Cancelled`,
              `Remarks: ${interview.remarks || 'N/A'}`,
            ],
          },
        ],
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
  getInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
};
