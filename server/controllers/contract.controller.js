const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');

const {
  Contract,
  ChatRoom,
  InterviewerRating,
  Job,
  Transaction,
  User,
} = require('../models');

const {
  sendEmail,
  generateEmailTemplate,
} = require('../utils/nodemailer.utils');
const { validateString } = require('../utils/validation.utils');

/**
 * @desc Create a new contract
 *
 * @route POST /api/contracts
 * @access Private (Recruiters, Admin)
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 *
 * @return {Promise<void>}
 * @throws {Error} If one of the required fields is missing
 * @throws {Error} If agreed price is not a positive number
 * @throws {Error} If job, recruiter, interviewer or chat room is not found
 */

const createContract = asyncHandler(async (req, res) => {
  const { jobId, agreedPrice, recruiterId, interviewerId, roomId } = req.body;

  if (!jobId || !agreedPrice || !recruiterId || !interviewerId || !roomId) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Please fill in all required fields to create a contract.');
  }

  if (isNaN(parseFloat(agreedPrice)) || parseFloat(agreedPrice) <= 0) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Agreed price must be a positive number.');
  }

  const [job, recruiter, interviewer, chatRoom] = await Promise.all([
    Job.findByPk(jobId),
    User.findByPk(recruiterId),
    User.findByPk(interviewerId),
    ChatRoom.findByPk(roomId),
  ]);

  if (!job) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Job not found. Please check and try again.');
  }

  if (!recruiter) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Recruiter not found. Please check and try again.');
  }

  if (!interviewer) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Interviewer not found. Please check and try again.');
  }

  if (!chatRoom) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Chat room not found. Please check and try again.');
  }

  if (!recruiter.isRecruiter) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(
      'Selected user is not a recruiter. Please verify the user role.'
    );
  }

  if (!interviewer.isInterviewer) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(
      'Selected user is not an interviewer. Please verify the user role.'
    );
  }

  const existingContract = await Contract.findOne({
    where: {
      jobId,
      recruiterId,
      interviewerId,
    },
  });

  if (existingContract) {
    res.status(StatusCodes.CONFLICT);
    throw new Error(
      'A contract already exists between these parties for this job.'
    );
  }

  const contract = await Contract.create({
    jobId,
    agreedPrice,
    recruiterId,
    interviewerId,
    roomId,
    status: 'pending',
    paymentStatus: 'pending',
  });

  if (!contract) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Unable to create contract. Please try again.');
  }

  const emailContent = [
    { type: 'heading', value: 'New Contract Created' },
    {
      type: 'text',
      value: 'A new contract has been created for your job posting.',
    },
    {
      type: 'list',
      value: [
        `Job Title: ${job.title}`,
        `Recruiter: ${recruiter.firstName} ${recruiter.lastName}`,
        `Interviewer: ${interviewer.firstName} ${interviewer.lastName}`,
        `Agreed Price: $${agreedPrice}`,
        `Status: ${contract.status}`,
        `Payment Status: ${contract.paymentStatus}`,
      ],
    },
  ];

  const isEmailSent = await sendEmail({
    to: recruiter.email,
    subject: 'OptaHire - New Contract Created',
    html: generateEmailTemplate({
      firstName: recruiter.firstName,
      subject: 'New Contract Created',
      content: emailContent,
    }),
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Contract created successfully but notification email could not be sent.'
    );
  }

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Contract created successfully',
    contract,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Get all contracts
 *
 * @route GET /api/contracts
 * @access Private (Admin)
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 *
 * @query {string} search - Search term to filter contracts by job title or description
 * @query {string} status - Filter contracts by status (pending, active, completed, cancelled)
 * @query {string} paymentStatus - Filter contracts by payment status (pending, paid, failed, refunded)
 * @query {string} recruiterId - Filter contracts by recruiter ID
 * @query {string} interviewerId - Filter contracts by interviewer ID
 * @query {string} jobId - Filter contracts by job ID
 * @query {number} limit - Limit the number of contracts returned
 *
 * @return {Promise<void>}
 * @throws {Error} If no contracts are found
 * @throws {Error} If invalid search criteria are provided
 * @throws {Error} If invalid status is provided
 * @throws {Error} If invalid payment status is provided
 * @throws {Error} If invalid recruiter ID is provided
 * @throws {Error} If invalid interviewer ID is provided
 * @throws {Error} If invalid job ID is provided
 */

const getAllContracts = asyncHandler(async (req, res) => {
  const {
    search,
    status,
    paymentStatus,
    recruiterId,
    interviewerId,
    jobId,
    limit,
  } = req.query;
  let whereClause = {};

  if (search) {
    whereClause = {
      [Op.or]: [
        { '$job.title$': { [Op.iLike]: `%${search}%` } },
        { '$job.description$': { [Op.iLike]: `%${search}%` } },
      ],
    };
  }

  if (status) whereClause.status = { [Op.iLike]: `%${status}%` };
  if (paymentStatus)
    whereClause.paymentStatus = { [Op.iLike]: `%${paymentStatus}%` };
  if (recruiterId) whereClause.recruiterId = recruiterId;
  if (interviewerId) whereClause.interviewerId = interviewerId;
  if (jobId) whereClause.jobId = jobId;

  const contracts = await Contract.findAll({
    where: whereClause,
    limit: limit ? parseInt(limit) : null,
    include: [
      {
        model: Job,
        as: 'job',
        attributes: ['title', 'description', 'isClosed'],
      },
      {
        model: User,
        as: 'recruiter',
        attributes: ['firstName', 'lastName', 'email'],
      },
      {
        model: User,
        as: 'interviewer',
        attributes: ['firstName', 'lastName', 'email'],
      },
      {
        model: ChatRoom,
        as: 'chatRoom',
        attributes: ['name', 'description', 'status'],
      },
      {
        model: InterviewerRating,
        as: 'interviewerRatings',
        attributes: ['rating', 'comment', 'createdAt'],
      },
      {
        model: Transaction,
        as: 'transactions',
        attributes: ['amount', 'status', 'createdAt'],
      },
    ],
  });

  if (!contracts || contracts.length === 0) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(
      'No contracts found. Please try different search criteria or check back later.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Successfully retrieved ${contracts.length} contracts`,
    count: contracts.length,
    contracts,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Get a contract by ID
 *
 * @route GET /api/contracts/:id
 * @access Private (Recruiters, Interviewers, Admin)
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 *
 * @return {Promise<void>}
 * @throws {Error} If contract is not found
 * @throws {Error} If contract ID is not provided
 */

const getContractById = asyncHandler(async (req, res) => {
  const contract = await Contract.findByPk(req.params.id, {
    include: [
      {
        model: Job,
        as: 'job',
        attributes: ['title', 'description', 'isClosed'],
      },
      {
        model: User,
        as: 'recruiter',
        attributes: ['firstName', 'lastName', 'email'],
      },
      {
        model: User,
        as: 'interviewer',
        attributes: ['firstName', 'lastName', 'email'],
      },
      {
        model: ChatRoom,
        as: 'chatRoom',
        attributes: ['name', 'description', 'status'],
      },
      {
        model: InterviewerRating,
        as: 'interviewerRatings',
        attributes: ['rating', 'comment', 'createdAt'],
      },
      {
        model: Transaction,
        as: 'transactions',
        attributes: ['amount', 'status', 'createdAt'],
      },
    ],
  });

  if (!contract) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Contract not found. Please check and try again.');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Contract found',
    contract,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Update a contract by ID
 *
 * @route PUT /api/contracts/:id
 * @access Private (Recruiters, Interviewers, Admin)
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {number} req.params.id - Contract ID
 *
 * @param {object} req.body - Request body
 * @param {number} req.body.agreedPrice - Agreed price for the contract
 * @param {string} req.body.status - Contract status (pending, active, completed, cancelled)
 * @param {string} req.body.paymentStatus - Payment status (pending, paid, failed, refunded)
 *
 * @return {Promise<void>}
 * @throws {Error} If no fields are provided to update the contract
 * @throws {Error} If contract is not found
 * @throws {Error} If agreed price is not a positive number
 * @throws {Error} If agreed price exceeds 1,000,000
 * @throws {Error} If status is invalid
 * @throws {Error} If payment status is invalid
 * @throws {Error} If contract update fails
 */

const updateContractById = asyncHandler(async (req, res) => {
  const { agreedPrice, status, paymentStatus } = req.body;

  if (!agreedPrice && !status && !paymentStatus) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(
      'Please provide at least one field to update the contract.'
    );
  }

  const contract = await Contract.findByPk(req.params.id, {
    include: [
      { model: Job, as: 'job' },
      { model: User, as: 'recruiter' },
      { model: User, as: 'interviewer' },
      { model: ChatRoom, as: 'chatRoom' },
    ],
  });

  if (!contract) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(
      'Contract not found. Please verify the contract ID and try again.'
    );
  }

  if (agreedPrice) {
    if (isNaN(parseFloat(agreedPrice)) || parseFloat(agreedPrice) <= 0) {
      res.status(StatusCodes.BAD_REQUEST);
      throw new Error(
        'Agreed price must be a positive number. Please enter a valid amount.'
      );
    }

    if (parseFloat(agreedPrice) > 1000000) {
      res.status(StatusCodes.BAD_REQUEST);
      throw new Error('Agreed price cannot exceed 1,000,000.');
    }
  }

  if (status) {
    const validStatuses = ['pending', 'active', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      res.status(StatusCodes.BAD_REQUEST);
      throw new Error(
        `Invalid contract status. Status must be one of: ${validStatuses.join(
          ', '
        )}`
      );
    }
  }

  if (paymentStatus) {
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

    if (!validPaymentStatuses.includes(paymentStatus)) {
      res.status(StatusCodes.BAD_REQUEST);
      throw new Error(
        `Invalid payment status. Payment status must be one of: ${validPaymentStatuses.join(
          ', '
        )}`
      );
    }
  }

  const updatedContract = await contract.update({
    agreedPrice: agreedPrice || contract.agreedPrice,
    status: status || contract.status,
    paymentStatus: paymentStatus || contract.paymentStatus,
  });

  if (!updatedContract) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'We encountered an issue updating your contract. Please try again later.'
    );
  }

  const emailContent = [
    { type: 'heading', value: 'Contract Updated' },
    {
      type: 'text',
      value: 'Your contract details have been updated successfully.',
    },
    {
      type: 'list',
      value: [
        `Job Title: ${contract.job.title}`,
        `Recruiter: ${contract.recruiter.firstName} ${contract.recruiter.lastName}`,
        `Interviewer: ${contract.interviewer.firstName} ${contract.interviewer.lastName}`,
        `Agreed Price: $${updatedContract.agreedPrice}`,
        `Status: ${updatedContract.status}`,
        `Payment Status: ${updatedContract.paymentStatus}`,
      ],
    },
  ];

  const isEmailSent = await Promise.all([
    sendEmail({
      to: contract.recruiter.email,
      subject: 'OptaHire - Contract Updated',
      html: generateEmailTemplate({
        firstName: contract.recruiter.firstName,
        subject: 'Contract Updated',
        content: emailContent,
      }),
    }),
    sendEmail({
      to: contract.interviewer.email,
      subject: 'OptaHire - Contract Updated',
      html: generateEmailTemplate({
        firstName: contract.interviewer.firstName,
        subject: 'Contract Updated',
        content: emailContent,
      }),
    }),
  ]);

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Contract updated successfully but notification email could not be sent.'
    );
  }

  const refreshedContract = await Contract.findByPk(req.params.id, {
    include: [
      {
        model: Job,
        as: 'job',
        attributes: ['title', 'description', 'isClosed'],
      },
      {
        model: User,
        as: 'recruiter',
        attributes: ['firstName', 'lastName', 'email'],
      },
      {
        model: User,
        as: 'interviewer',
        attributes: ['firstName', 'lastName', 'email'],
      },
      {
        model: ChatRoom,
        as: 'chatRoom',
        attributes: ['name', 'description', 'status'],
      },
      {
        model: InterviewerRating,
        as: 'interviewerRatings',
        attributes: ['rating', 'comment', 'createdAt'],
      },
      {
        model: Transaction,
        as: 'transactions',
        attributes: ['amount', 'status', 'createdAt'],
      },
    ],
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Contract updated successfully!',
    contract: refreshedContract,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Delete a contract by ID
 *
 * @route DELETE /api/contracts/:id
 * @access Private (Admin)
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {number} req.params.id - Contract ID
 *
 * @return {Promise<void>}
 * @throws {Error} If contract is not found
 * @throws {Error} If contract deletion fails
 * @throws {Error} If notification email could not be sent
 * @throws {Error} If contract is deleted but email is not sent
 */

const deleteContractById = asyncHandler(async (req, res) => {
  const contract = await Contract.findByPk(req.params.id);

  if (!contract) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Contract not found. Please check and try again.');
  }

  const isDeleted = await contract.destroy();

  if (!isDeleted) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Unable to delete contract. Please try again later.');
  }

  const emailContent = [
    { type: 'heading', value: 'Contract Deleted' },
    { type: 'text', value: 'Your contract has been deleted successfully.' },
    {
      type: 'list',
      value: [
        `Job Title: ${contract.job.title}`,
        `Recruiter: ${contract.recruiter.firstName} ${contract.recruiter.lastName}`,
        `Interviewer: ${contract.interviewer.firstName} ${contract.interviewer.lastName}`,
        `Agreed Price: $${contract.agreedPrice}`,
        `Status: ${contract.status}`,
        `Payment Status: ${contract.paymentStatus}`,
      ],
    },
    {
      type: 'text',
      value: 'Please contact us if you have any questions or concerns.',
    },
  ];

  const isEmailSent = await Promise.all([
    sendEmail({
      to: contract.recruiter.email,
      subject: 'OptaHire - Contract Deleted',
      html: generateEmailTemplate({
        firstName: contract.recruiter.firstName,
        subject: 'Contract Deleted',
        content: emailContent,
      }),
    }),
    sendEmail({
      to: contract.interviewer.email,
      subject: 'OptaHire - Contract Deleted',
      html: generateEmailTemplate({
        firstName: contract.interviewer.firstName,
        subject: 'Contract Deleted',
        content: emailContent,
      }),
    }),
  ]);

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Contract deleted successfully but notification email could not be sent.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Contract deleted successfully',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Get contracts by job ID
 *
 * @route GET /api/contracts/job/:jobId
 * @access Private (Recruiters, Interviewers, Admin)
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {number} req.params.jobId - Job ID
 *
 * @return {Promise<void>}
 * @throws {Error} If job ID is not provided
 * @throws {Error} If job is not found
 * @throws {Error} If no contracts are found for the job
 * @throws {Error} If contracts retrieval fails
 */

const getContractsByJobId = asyncHandler(async (req, res) => {
  const jobId = req.params.jobId;

  if (!jobId) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Please provide a job ID to retrieve contracts.');
  }

  const job = await Job.findByPk(jobId);

  if (!job) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Job not found. Please check and try again.');
  }

  const contracts = await Contract.findAll({
    where: { jobId: req.params.jobId },
    include: [
      {
        model: Job,
        as: 'job',
        attributes: ['title', 'description', 'isClosed'],
      },
      {
        model: User,
        as: 'recruiter',
        attributes: ['firstName', 'lastName', 'email'],
      },
      {
        model: User,
        as: 'interviewer',
        attributes: ['firstName', 'lastName', 'email'],
      },
      {
        model: ChatRoom,
        as: 'chatRoom',
        attributes: ['name', 'description', 'status'],
      },
      {
        model: InterviewerRating,
        as: 'interviewerRatings',
        attributes: ['rating', 'comment', 'createdAt'],
      },
      {
        model: Transaction,
        as: 'transactions',
        attributes: ['amount', 'status', 'createdAt'],
      },
    ],
  });

  if (!contracts || contracts.length === 0) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(
      'No contracts found for this job. Please check back later.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Successfully retrieved ${contracts.length} contracts for this job`,
    count: contracts.length,
    contracts,
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  createContract,
  getAllContracts,
  getContractById,
  updateContractById,
  deleteContractById,
  getContractsByJobId,
};
