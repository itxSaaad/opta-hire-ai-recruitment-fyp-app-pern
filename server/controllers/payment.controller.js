const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const { User, Job, Contract, Transaction } = require('../models');

const {
  sendEmail,
  generateEmailTemplate,
} = require('../utils/nodemailer.utils');

/**
 * @desc Create a new Checkout Session for the contract payment
 *
 * @route POST /api/payment/checkout-session/:contractId
 * @access Private (Recruiter)
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 *
 * @returns {object} - Success message and Checkout Session ID
 */

const createCheckoutSession = asyncHandler(async (req, res) => {
  const { contractId } = req.params;

  // Retrieve the contract record
  const contract = await Contract.findByPk(contractId, {
    include: [
      { model: User, as: 'recruiter' },
      { model: User, as: 'interviewer' },
      { model: Job, as: 'job' },
    ],
  });

  if (!contract) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Contract not found. Please check and try again.');
  }

  // Create a Checkout Session with PaymentIntent data configured for manual capture
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Interview Service for ${contract.job.title}`,
            description: `Contract between ${contract.recruiter.firstName} (recruiter) and ${contract.interviewer.firstName} (interviewer)`,
          },
          unit_amount: Math.round(parseFloat(contract.agreedPrice) * 100),
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      capture_method: 'manual',
      metadata: { contractId: contract.id },
    },
    success_url: `${process.env.CLIENT_URL}/contract/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/contract/payment-cancelled`,
  });

  if (!session) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Unable to create payment session. Please try again later.'
    );
  }

  // Save the PaymentIntent ID in the contract record
  contract.paymentIntentId = session.payment_intent;

  const updatedContract = await contract.save();

  if (!updatedContract) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Unable to process your payment. Please try again later.');
  }

  // Create a transaction record for the payment intent
  const transaction = await Transaction.create({
    contractId: contract.id,
    amount: contract.agreedPrice,
    status: 'pending',
    transactionType: 'payment',
    transactionDate: new Date(),
  });

  if (!transaction) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Payment initiated but transaction record failed. Please contact support.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Payment session created successfully. Proceed to checkout.',
    sessionId: session.id,
    timeStamp: new Date().toISOString(),
  });
});

/**
 * @desc Capture the payment for the contract
 *
 * @route POST /api/payment/capture/:contractId
 * @access Private (Interviewer)
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 *
 * @returns {object} - Success message and captured payment details
 */

const capturePayment = asyncHandler(async (req, res) => {
  const { contractId } = req.params;

  // Retrieve the contract
  const contract = await Contract.findByPk(contractId);

  if (!contract || !contract.paymentIntentId) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(
      'Payment information not found. Please verify contract details and try again.'
    );
  }

  // Capture the PaymentIntent to finalize the charge
  const capturedPayment = await stripe.paymentIntents.capture(
    contract.paymentIntentId
  );

  if (!capturedPayment) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Payment capture failed. Please contact support.');
  }

  // Log the capture transaction
  const transaction = await Transaction.create({
    contractId: contract.id,
    amount: contract.agreedPrice,
    status: 'completed',
    transactionType: 'payment',
    transactionDate: new Date(),
  });

  if (!transaction) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Payment processed, but transaction recording failed. Please contact support.'
    );
  }

  // Update contract payment status (and optionally contract status)
  contract.status = 'active';
  contract.paymentStatus = 'paid';

  const updatedContract = await contract.save();

  if (!updatedContract) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Payment successful, but contract status update failed. Our team has been notified.'
    );
  }

  // Send email notification to the recruiter
  const isEmailSent = await sendEmail({
    from: process.env.NODEMAILER_SMTP_EMAIL,
    to: contract.recruiter.email,
    subject: 'OptaHire - Payment Confirmation',
    html: generateEmailTemplate({
      firstName: contract.recruiter.firstName,
      subject: 'OptaHire - Payment Confirmation',
      content: [
        {
          type: 'heading',
          value: 'Payment Captured Successfully!',
        },
        {
          type: 'text',
          value: `Your payment of $${contract.agreedPrice} has been processed successfully.`,
        },
        {
          type: 'heading',
          value: 'Payment Details',
        },
        {
          type: 'list',
          value: [
            `Job Title: ${contract.job.title}`,
            `Amount: $${contract.agreedPrice}`,
            `Date: ${new Date().toLocaleDateString()}`,
            `Contract Status: ${contract.status}`,
          ],
        },
        {
          type: 'text',
          value:
            'Thank you for using OptaHire. You can view your contract details in your account dashboard.',
        },
        {
          type: 'cta',
          value: {
            text: 'View Contract Details',
            link: `${process.env.CLIENT_URL}/dashboard/contracts`,
          },
        },
      ],
    }),
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Payment processed successfully, but notification email could not be delivered.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Payment captured successfully. Your contract is now active.',
    capturedPayment,
    timeStamp: new Date().toISOString(),
  });
});

/**
 * @desc Complete the contract payment and transfer funds to the interviewer
 *
 * @route POST /api/payment/complete/:contractId
 * @access Private (Recruiter)
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 *
 * @returns {object} - Success message and transfer details
 */

const completeContractPayment = asyncHandler(async (req, res) => {
  const { contractId } = req.params;

  // Retrieve the contract with related data
  const contract = await Contract.findByPk(contractId, {
    include: [
      { model: User, as: 'recruiter' },
      { model: User, as: 'interviewer' },
      { model: Job, as: 'job' },
    ],
  });

  if (!contract) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(
      'Contract not found. Please check the contract ID and try again.'
    );
  }

  if (contract.paymentStatus !== 'paid') {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(
      'Initial payment must be completed before funds can be released.'
    );
  }

  // Calculate amounts (in cents)
  const totalAmountCents = Math.round(parseFloat(contract.agreedPrice) * 100);
  const commissionFee = Math.round(totalAmountCents * 0.025); // 2.5% commission
  const interviewerAmount = totalAmountCents - commissionFee;

  // Retrieve the interviewer's Stripe connected account ID
  const interviewer = await User.findByPk(contract.interviewerId);

  if (!interviewer || !interviewer.stripeAccountId) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(
      'Interviewer payment account not configured. Please contact support.'
    );
  }

  // Transfer funds to the interviewer's connected account using Stripe Connect
  const transfer = await stripe.transfers.create({
    amount: interviewerAmount,
    currency: 'usd',
    destination: interviewer.stripeAccountId,
    description: `Payment for interview service: ${contract.job.title}`,
  });

  if (!transfer) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error('Payment transfer failed. Our team has been notified.');
  }

  // Log the payout transaction
  const transaction = await Transaction.create({
    contractId: contract.id,
    amount: (interviewerAmount / 100).toFixed(2), // Convert cents back to dollars
    status: 'completed',
    transactionType: 'payout',
    transactionDate: new Date(),
  });

  if (!transaction) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Transaction recording failed. Your payment is being processed.'
    );
  }

  // Update the contract status
  contract.status = 'completed';

  const updatedContract = await contract.save();

  if (!updatedContract) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Contract status update failed. Please refresh and try again.'
    );
  }

  // Send email notification to interviewer
  const isEmailSent = await sendEmail({
    from: process.env.NODEMAILER_SMTP_EMAIL,
    to: contract.interviewer.email,
    subject: 'OptaHire - Payment Transfer',
    html: generateEmailTemplate({
      firstName: contract.interviewer.firstName,
      subject: 'OptaHire - Payment Transfer',
      content: [
        {
          type: 'heading',
          value: 'Payment Transfer Complete!',
        },
        {
          type: 'text',
          value: `A payment of $${(interviewerAmount / 100).toFixed(
            2
          )} has been transferred to your account for your interview services.`,
        },
        {
          type: 'heading',
          value: 'Payment Details',
        },
        {
          type: 'list',
          value: [
            `Job Title: ${contract.job.title}`,
            `Amount: $${(interviewerAmount / 100).toFixed(2)}`,
            `Date: ${new Date().toLocaleDateString()}`,
            `Contract Status: ${contract.status}`,
          ],
        },
        {
          type: 'text',
          value:
            'Thank you for using OptaHire. You can view your earnings in your account dashboard.',
        },
        {
          type: 'cta',
          value: {
            text: 'View Your Earnings',
            link: `${process.env.CLIENT_URL}/dashboard/earnings`,
          },
        },
      ],
    }),
  });

  if (!isEmailSent) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      'Payment transferred successfully, but notification email could not be delivered.'
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Payment successfully transferred to interviewer.',
    transfer,
    timeStamp: new Date().toISOString(),
  });
});

module.exports = {
  createCheckoutSession,
  capturePayment,
  completeContractPayment,
};
