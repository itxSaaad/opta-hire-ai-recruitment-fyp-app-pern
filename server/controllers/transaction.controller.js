const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');

const { Contract, Transaction, User } = require('../models');

const {
  sendEmail,
  generateEmailTemplate,
} = require('../utils/nodemailer.utils');
const { validateString } = require('../utils/validation.utils');

/**
 * @desc   Create new transaction
 *
 * @route  POST /api/transactions
 * @access Private
 * @role   Recruiter, Interviewer
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 *
 * @returns {Promise<void>}
 */

const createTransaction = asyncHandler(async (req, res) => {
  const { contractId, amount, status } = req.body;

  if (!validateString(contractId)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Please provide a valid Contract ID.');
  }

  if (
    !status ||
    !['pending', 'completed', 'failed', 'cancelled'].includes(status)
  ) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(
      'Please provide a valid status: pending, completed, failed, or cancelled.'
    );
  }

  const contract = await Contract.findByPk(contractId, {
    where: {
      status: {
        [Op.or]: ['active', 'completed'],
      },
    },
    include: [
      { model: User, as: 'recruiter' },
      { model: User, as: 'interviewer' },
    ],
  });

  if (!contract) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(
      'Contract not found. Please check the details and try again.'
    );
  }

  const transaction = await Transaction.create({
    contractId,
    amount,
    status,
    transactionDate: new Date(),
  });

  if (!transaction) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Unable to process transaction. Please try again later.');
  }

  const recruiterEmailContent = [
    {
      type: 'text',
      value: `Hello ${contract.recruiter.firstName},`,
    },
    {
      type: 'heading',
      value: 'Transaction Processed Successfully',
    },
    {
      type: 'list',
      value: [
        `Transaction Amount: $${amount}`,
        `Status: ${status}`,
        `Date: ${new Date().toLocaleDateString()}`,
        `Contract ID: ${contractId}`,
      ],
    },
    {
      type: 'text',
      value: 'Please check your account for the updated balance.',
    },
    {
      type: 'text',
      value: 'Thank you for using OptaHire.',
    },
  ];

  const interviewerEmailContent = [
    {
      type: 'text',
      value: `Hello ${contract.interviewer.firstName},`,
    },
    {
      type: 'heading',
      value: 'Transaction Processed Successfully',
    },
    {
      type: 'list',
      value: [
        `Transaction Amount: $${amount}`,
        `Status: ${status}`,
        `Date: ${new Date().toLocaleDateString()}`,
        `Contract ID: ${contractId}`,
      ],
    },
    {
      type: 'text',
      value: 'Please check your account for the updated balance.',
    },
    {
      type: 'text',
      value: 'Thank you for using OptaHire.',
    },
  ];

  const recruiterEmailHtml = generateEmailTemplate({
    firstName: contract.recruiter.firstName,
    subject: 'OptaHire - Transaction Processed',
    content: recruiterEmailContent,
  });

  const interviewerEmailHtml = generateEmailTemplate({
    firstName: contract.interviewer.firstName,
    subject: 'OptaHire - Transaction Processed',
    content: interviewerEmailContent,
  });

  const isEmailSent = await Promise.all([
    sendEmail({
      from: process.env.NODEMAILER_SMTP_EMAIL,
      to: contract.recruiter.email,
      subject: 'OptaHire - Transaction Processed',
      html: recruiterEmailHtml,
    }),
    sendEmail({
      from: process.env.NODEMAILER_SMTP_EMAIL,
      to: contract.interviewer.email,
      subject: 'OptaHire - Transaction Processed',
      html: interviewerEmailHtml,
    }),
  ]);

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Transaction processed successfully but notification emails could not be delivered.'
    );
  }

  res.status(StatusCodes.CREATED).json({
    transaction,
    success: true,
    message: 'Transaction processed successfully',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc   Get all transactions
 *
 * @route  GET /api/transactions
 * @access Private
 * @role   Admin, Recruiter, Interviewer
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 *
 * @returns {Promise<void>}
 */

const getAllTransactions = asyncHandler(async (req, res) => {
  const {
    status,
    contractId,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    limit,
  } = req.query;
  let whereClause = {};

  if (status) {
    whereClause.status = status;
  }

  if (contractId) whereClause.contractId = contractId;

  if (startDate && endDate) {
    whereClause.transactionDate = {
      [Op.between]: [new Date(startDate), new Date(endDate)],
    };
  } else if (startDate) {
    whereClause.transactionDate = { [Op.gte]: new Date(startDate) };
  } else if (endDate) {
    whereClause.transactionDate = { [Op.lte]: new Date(endDate) };
  }

  if (minAmount && maxAmount) {
    whereClause.amount = { [Op.between]: [minAmount, maxAmount] };
  } else if (minAmount) {
    whereClause.amount = { [Op.gte]: minAmount };
  } else if (maxAmount) {
    whereClause.amount = { [Op.lte]: maxAmount };
  }

  const transactions = await Transaction.findAll({
    where: whereClause,
    limit: limit ? parseInt(limit) : null,
    include: [
      {
        model: Contract,
        include: [
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
        ],
      },
    ],
  });

  if (!transactions || transactions.length === 0) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(
      'No transactions found. Try modifying your search filters.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: `${transactions.length} transactions retrieved successfully`,
    count: transactions.length,
    transactions,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc   Get transaction by ID
 *
 * @route  GET /api/transactions/:id
 * @access Private
 * @role   Admin, Recruiter, Interviewer
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 *
 * @returns {Promise<void>}
 */

const getTransactionById = asyncHandler(async (req, res) => {
  const transactionId = req.params.id;

  if (!transactionId) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(
      'Invalid transaction ID format. Please provide a valid ID.'
    );
  }

  const transaction = await Transaction.findByPk(transactionId, {
    include: [
      {
        model: Contract,
        include: [
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
        ],
      },
    ],
  });

  if (!transaction) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(
      'Transaction not found. Please verify the ID and try again.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Transaction details retrieved successfully',
    transaction,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc   Update transaction by ID
 *
 * @route  PUT /api/transactions/:id
 * @access Private
 * @role   Admin
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 *
 * @returns {Promise<void>}
 */

const updateTransactionById = asyncHandler(async (req, res) => {
  const transactionId = req.params.id;
  const { amount, status } = req.body;

  if (!validateString(transactionId)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(
      'Invalid transaction ID. Please provide a valid identifier.'
    );
  }

  if (amount !== undefined) {
    if (isNaN(amount) || parseFloat(amount) < 0) {
      res.status(StatusCodes.BAD_REQUEST);
      throw new Error(
        'Transaction amount must be a valid number greater than or equal to 0.'
      );
    }
  }

  if (
    status &&
    !['pending', 'completed', 'failed', 'cancelled'].includes(status)
  ) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(
      'Invalid status selection. Please choose: pending, completed, failed, or cancelled.'
    );
  }

  const transaction = await Transaction.findByPk(transactionId, {
    include: [
      {
        model: Contract,
        include: [
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
        ],
      },
    ],
  });

  if (!transaction) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(
      'Transaction not found. Please verify the details and try again.'
    );
  }

  const updatedTransaction = await transaction.update({
    amount: amount !== undefined ? amount : transaction.amount,
    status: status || transaction.status,
  });

  if (!updatedTransaction) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Failed to update transaction. Please try again later.');
  }

  const commonListItems = [
    `Transaction Amount: $${updatedTransaction.amount}`,
    `Status: ${updatedTransaction.status}`,
    `Date: ${new Date().toLocaleDateString()}`,
    `Contract ID: ${transaction.contractId}`,
  ];

  const recruiterEmailContent = [
    {
      type: 'text',
      value: `Hello ${transaction.contract.recruiter.firstName},`,
    },
    {
      type: 'heading',
      value: 'Transaction Updated',
    },
    {
      type: 'list',
      value: commonListItems,
    },
    {
      type: 'text',
      value: 'Please check your account for the updated balance.',
    },
    {
      type: 'text',
      value: 'Thank you for using OptaHire.',
    },
  ];

  const interviewerEmailContent = [
    {
      type: 'text',
      value: `Hello ${transaction.contract.interviewer.firstName},`,
    },
    {
      type: 'heading',
      value: 'Transaction Updated',
    },
    {
      type: 'list',
      value: commonListItems,
    },
    {
      type: 'text',
      value: 'Please check your account for the updated balance.',
    },
    {
      type: 'text',
      value: 'Thank you for using OptaHire.',
    },
  ];

  const recruiterEmailHtml = generateEmailTemplate({
    firstName: transaction.contract.recruiter.firstName,
    subject: 'OptaHire - Transaction Updated',
    content: recruiterEmailContent,
  });

  const interviewerEmailHtml = generateEmailTemplate({
    firstName: transaction.contract.interviewer.firstName,
    subject: 'OptaHire - Transaction Updated',
    content: interviewerEmailContent,
  });

  const isEmailSent = await Promise.all([
    sendEmail({
      from: process.env.NODEMAILER_SMTP_EMAIL,
      to: transaction.contract.recruiter.email,
      subject: 'OptaHire - Transaction Updated',
      html: recruiterEmailHtml,
    }),
    sendEmail({
      from: process.env.NODEMAILER_SMTP_EMAIL,
      to: transaction.contract.interviewer.email,
      subject: 'OptaHire - Transaction Updated',
      html: interviewerEmailHtml,
    }),
  ]);

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Transaction updated successfully but notification emails could not be delivered.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Transaction updated successfully',
    updatedTransaction,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc   Delete transaction by ID
 *
 * @route  DELETE /api/transactions/:id
 * @access Private
 * @role   Admin
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 *
 * @returns {Promise<void>}
 */

const deleteTransactionById = asyncHandler(async (req, res) => {
  const transactionId = req.params.id;

  if (!validateString(transactionId)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(
      'Invalid transaction ID. Please provide a valid identifier.'
    );
  }

  const transaction = await Transaction.findByPk(transactionId, {
    include: [
      {
        model: Contract,
        include: [
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
        ],
      },
    ],
  });

  if (!transaction) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(
      'Transaction not found. Please verify the details and try again.'
    );
  }

  const isDeleted = await transaction.destroy();

  if (!isDeleted) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Failed to delete transaction. Please try again later.');
  }

  const commonListItems = [
    `Transaction Amount: $${transaction.amount}`,
    `Status: ${transaction.status}`,
    `Date: ${new Date().toLocaleDateString()}`,
    `Contract ID: ${transaction.contractId}`,
  ];

  const recruiterEmailContent = [
    {
      type: 'text',
      value: `Hello ${transaction.contract.recruiter.firstName},`,
    },
    {
      type: 'heading',
      value: 'Transaction Deleted',
    },
    {
      type: 'list',
      value: commonListItems,
    },
    {
      type: 'text',
      value: 'Please contact support for more information.',
    },
    {
      type: 'text',
      value: 'Thank you for using OptaHire.',
    },
  ];

  const interviewerEmailContent = [
    {
      type: 'text',
      value: `Hello ${transaction.contract.interviewer.firstName},`,
    },
    {
      type: 'heading',
      value: 'Transaction Deleted',
    },
    {
      type: 'list',
      value: commonListItems,
    },
    {
      type: 'text',
      value: 'Please contact support for more information.',
    },
    {
      type: 'text',
      value: 'Thank you for using OptaHire.',
    },
  ];

  const recruiterEmailHtml = generateEmailTemplate({
    firstName: transaction.contract.recruiter.firstName,
    subject: 'OptaHire - Transaction Deleted',
    content: recruiterEmailContent,
  });

  const interviewerEmailHtml = generateEmailTemplate({
    firstName: transaction.contract.interviewer.firstName,
    subject: 'OptaHire - Transaction Deleted',
    content: interviewerEmailContent,
  });

  const isEmailSent = await Promise.all([
    sendEmail({
      from: process.env.NODEMAILER_SMTP_EMAIL,
      to: transaction.contract.recruiter.email,
      subject: 'OptaHire - Transaction Deleted',
      html: recruiterEmailHtml,
    }),
    sendEmail({
      from: process.env.NODEMAILER_SMTP_EMAIL,
      to: transaction.contract.interviewer.email,
      subject: 'OptaHire - Transaction Deleted',
      html: interviewerEmailHtml,
    }),
  ]);

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Transaction deleted successfully but notification emails could not be delivered.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Transaction deleted successfully',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc   Get transactions by contract
 *
 * @route  GET /api/transactions/contract/:contractId
 * @access Private
 * @role   Admin, Recruiter, Interviewer
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 *
 * @returns {Promise<void>}
 */

const getTransactionsByContract = asyncHandler(async (req, res) => {
  const contractId = req.params.contractId;

  if (!validateString(contractId)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Invalid contract ID. Please provide a valid identifier.');
  }

  const transactions = await Transaction.findAll({
    where: { contractId },
    include: [
      {
        model: Contract,
        include: [
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
        ],
      },
    ],
  });

  if (!transactions || transactions.length === 0) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(
      'No transactions found for this contract. Please verify the details and try again.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: `${transactions.length} transactions retrieved successfully`,
    count: transactions.length,
    transactions,
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  getTransactionsByContract,
  updateTransactionById,
  deleteTransactionById,
};
