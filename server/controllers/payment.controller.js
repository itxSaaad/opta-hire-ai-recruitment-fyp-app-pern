const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const { User, Contract, Transaction, Job } = require('../models');
const {
  sendEmail,
  generateEmailTemplate,
} = require('../utils/nodemailer.utils');

const PLATFORM_FEE_PERCENTAGE = 0.025; // 2.5%

/**
 * @desc Create Stripe Connect account for interviewer
 * @route POST /api/v1/payments/connect/onboard
 * @access Private (Interviewer)
 */
const createStripeConnectAccount = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user.isInterviewer) {
    res.status(StatusCodes.FORBIDDEN);
    throw new Error('Only interviewers can create Stripe Connect accounts.');
  }

  if (user.stripeAccountId) {
    res.status(StatusCodes.CONFLICT);
    throw new Error('Stripe Connect account already exists for this user.');
  }

  try {
    // Create Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US', // You might want to make this dynamic based on user location
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      individual: {
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
      },
    });

    // Update user with Stripe account ID
    await User.update(
      {
        stripeAccountId: account.id,
        stripeAccountStatus: 'pending',
      },
      { where: { id: user.id } }
    );

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.CLIENT_URL}/interviewer/stripe/refresh`,
      return_url: `${process.env.CLIENT_URL}/interviewer/stripe/return`,
      type: 'account_onboarding',
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Stripe Connect account created successfully.',
      data: {
        accountId: account.id,
        onboardingUrl: accountLink.url,
        accountStatus: 'pending',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(`Stripe Connect account creation failed: ${error.message}`);
  }
});

/**
 * @desc Get Stripe Connect account status
 * @route GET /api/v1/payments/connect/status
 * @access Private (Interviewer)
 */
const getStripeConnectStatus = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user.isInterviewer) {
    res.status(StatusCodes.FORBIDDEN);
    throw new Error('Only interviewers can check Stripe Connect status.');
  }

  if (!user.stripeAccountId) {
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'No Stripe Connect account found.',
      data: {
        hasAccount: false,
        accountStatus: null,
        payoutEnabled: false,
      },
      timestamp: new Date().toISOString(),
    });
  }

  try {
    // Retrieve account from Stripe
    const account = await stripe.accounts.retrieve(user.stripeAccountId);

    let accountStatus = 'pending';
    const payoutEnabled = account.payouts_enabled;
    const chargesEnabled = account.charges_enabled;

    if (payoutEnabled && chargesEnabled) {
      accountStatus = 'verified';
    } else if (account.requirements.currently_due.length > 0) {
      accountStatus = 'restricted';
    }

    // Update user status in database
    await User.update(
      {
        stripeAccountStatus: accountStatus,
        payoutEnabled: payoutEnabled,
      },
      { where: { id: user.id } }
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Stripe Connect status retrieved successfully.',
      data: {
        hasAccount: true,
        accountId: user.stripeAccountId,
        accountStatus: accountStatus,
        payoutEnabled: payoutEnabled,
        chargesEnabled: chargesEnabled,
        requirementsDue: account.requirements.currently_due,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(
      `Failed to retrieve Stripe Connect status: ${error.message}`
    );
  }
});

/**
 * @desc Create account link for re-onboarding
 * @route POST /api/v1/payments/connect/refresh
 * @access Private (Interviewer)
 */
const refreshStripeConnectLink = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user.isInterviewer || !user.stripeAccountId) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Invalid Stripe Connect account.');
  }

  try {
    const accountLink = await stripe.accountLinks.create({
      account: user.stripeAccountId,
      refresh_url: `${process.env.CLIENT_URL}/interviewer/stripe/refresh`,
      return_url: `${process.env.CLIENT_URL}/interviewer/stripe/return`,
      type: 'account_onboarding',
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Stripe Connect onboarding link refreshed.',
      data: {
        onboardingUrl: accountLink.url,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(`Failed to refresh onboarding link: ${error.message}`);
  }
});

/**
 * @desc Get Stripe Connect dashboard link
 * @route GET /api/v1/payments/connect/dashboard
 * @access Private (Interviewer)
 */
const getStripeConnectDashboard = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user.isInterviewer || !user.stripeAccountId) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Invalid Stripe Connect account.');
  }

  try {
    const loginLink = await stripe.accounts.createLoginLink(
      user.stripeAccountId
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Stripe Connect dashboard link generated.',
      data: {
        dashboardUrl: loginLink.url,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(`Failed to generate dashboard link: ${error.message}`);
  }
});

/**
 * @desc Create payment intent for contract
 * @route POST /api/v1/payments/contracts/:contractId/pay
 * @access Private (Recruiter)
 */
const createContractPayment = asyncHandler(async (req, res) => {
  const { contractId } = req.params;
  const user = req.user;

  if (!user.isRecruiter) {
    res.status(StatusCodes.FORBIDDEN);
    throw new Error('Only recruiters can make contract payments.');
  }

  // Get contract with related data
  const contract = await Contract.findByPk(contractId, {
    include: [
      { model: User, as: 'recruiter' },
      { model: User, as: 'interviewer' },
      { model: Job, as: 'job' },
    ],
  });

  if (!contract) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Contract not found.');
  }

  if (contract.recruiterId !== user.id) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error('You can only pay for your own contracts.');
  }

  if (contract.paymentStatus === 'paid') {
    res.status(StatusCodes.CONFLICT);
    throw new Error('Contract has already been paid.');
  }

  if (
    !contract.interviewer.stripeAccountId ||
    !contract.interviewer.payoutEnabled
  ) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Interviewer has not completed Stripe Connect setup.');
  }

  try {
    // Calculate platform fee
    const amount = Math.round(contract.agreedPrice * 100); // Convert to cents
    const applicationFee = Math.round(amount * PLATFORM_FEE_PERCENTAGE);

    // Create customer if doesn't exist
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: user.id,
          userType: 'recruiter',
        },
      });
      customerId = customer.id;

      await User.update(
        { stripeCustomerId: customerId },
        { where: { id: user.id } }
      );
    }

    // Create PaymentIntent with application fee
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      customer: customerId,
      application_fee_amount: applicationFee,
      transfer_data: {
        destination: contract.interviewer.stripeAccountId,
      },
      metadata: {
        contractId: contractId,
        recruiterId: user.id,
        interviewerId: contract.interviewerId,
        jobId: contract.jobId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update contract with payment intent
    await Contract.update(
      {
        paymentIntentId: paymentIntent.id,
        stripeApplicationFee: applicationFee / 100, // Store in dollars
      },
      { where: { id: contractId } }
    );

    // Create transaction record
    await Transaction.create({
      amount: contract.agreedPrice,
      status: 'pending',
      transactionDate: new Date(),
      transactionType: 'payment',
      contractId: contractId,
      stripePaymentIntentId: paymentIntent.id,
      platformFee: applicationFee / 100,
      netAmount: (amount - applicationFee) / 100,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Payment intent created successfully.',
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: contract.agreedPrice,
        platformFee: applicationFee / 100,
        netAmount: (amount - applicationFee) / 100,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(`Payment intent creation failed: ${error.message}`);
  }
});

/**
 * @desc Confirm contract payment
 * @route POST /api/v1/payments/contracts/:contractId/confirm
 * @access Private (Recruiter)
 */
const confirmContractPayment = asyncHandler(async (req, res) => {
  const { contractId } = req.params;
  const { paymentIntentId } = req.body;
  const user = req.user;

  const contract = await Contract.findByPk(contractId, {
    include: [
      { model: User, as: 'recruiter' },
      { model: User, as: 'interviewer' },
    ],
  });

  if (!contract || contract.recruiterId !== user.id) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Contract not found or unauthorized.');
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update contract status
      await Contract.update(
        {
          paymentStatus: 'paid',
          status: 'active',
        },
        { where: { id: contractId } }
      );

      // Update transaction status
      await Transaction.update(
        { status: 'completed' },
        {
          where: {
            contractId: contractId,
            stripePaymentIntentId: paymentIntentId,
          },
        }
      );

      // Send confirmation emails
      await Promise.all([
        // Email to recruiter
        sendEmail({
          from: process.env.NODEMAILER_SMTP_EMAIL,
          to: contract.recruiter.email,
          subject: 'OptaHire - Payment Confirmed',
          html: generateEmailTemplate({
            firstName: contract.recruiter.firstName,
            subject: 'Payment Confirmed - Contract Active',
            content: [
              {
                type: 'heading',
                value: 'Payment Confirmed!',
              },
              {
                type: 'text',
                value: `Your payment of $${contract.agreedPrice} for the interview contract has been confirmed. The funds are now held securely and will be released to the interviewer upon contract completion.`,
              },
              {
                type: 'text',
                value: `Contract ID: ${contractId}`,
              },
            ],
          }),
        }),
        // Email to interviewer
        sendEmail({
          from: process.env.NODEMAILER_SMTP_EMAIL,
          to: contract.interviewer.email,
          subject: 'OptaHire - Contract Payment Received',
          html: generateEmailTemplate({
            firstName: contract.interviewer.firstName,
            subject: 'Contract Payment Received',
            content: [
              {
                type: 'heading',
                value: 'Contract Payment Received!',
              },
              {
                type: 'text',
                value: `The recruiter has paid $${contract.agreedPrice} for your interview services. The funds are held securely and will be transferred to your account upon contract completion.`,
              },
              {
                type: 'text',
                value: `After our 2.5% platform fee, you will receive $${(contract.agreedPrice * (1 - PLATFORM_FEE_PERCENTAGE)).toFixed(2)}.`,
              },
            ],
          }),
        }),
      ]);

      res.status(StatusCodes.OK).json({
        success: true,
        message: 'Payment confirmed successfully.',
        data: {
          contractId: contractId,
          paymentStatus: 'paid',
          contractStatus: 'active',
          amount: contract.agreedPrice,
        },
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(StatusCodes.BAD_REQUEST);
      throw new Error('Payment not completed successfully.');
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(`Payment confirmation failed: ${error.message}`);
  }
});

/**
 * @desc Complete contract and trigger payout
 * @route POST /api/v1/payments/contracts/:contractId/complete
 * @access Private (Interviewer, Recruiter, Admin)
 */
const completeContractAndPayout = asyncHandler(async (req, res) => {
  const { contractId } = req.params;
  const user = req.user;

  const contract = await Contract.findByPk(contractId, {
    include: [
      { model: User, as: 'recruiter' },
      { model: User, as: 'interviewer' },
    ],
  });

  if (!contract) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Contract not found.');
  }

  // Check authorization
  if (
    !user.isAdmin &&
    contract.recruiterId !== user.id &&
    contract.interviewerId !== user.id
  ) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error('You are not authorized to complete this contract.');
  }

  if (contract.status === 'completed') {
    res.status(StatusCodes.CONFLICT);
    throw new Error('Contract is already completed.');
  }

  if (contract.paymentStatus !== 'paid') {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Contract must be paid before completion.');
  }

  try {
    // The transfer to the connected account happens automatically when PaymentIntent succeeds
    // We just need to update the contract status and create payout transaction

    // Update contract status
    await Contract.update(
      { status: 'completed' },
      { where: { id: contractId } }
    );

    // Create payout transaction record
    const netAmount = contract.agreedPrice * (1 - PLATFORM_FEE_PERCENTAGE);

    await Transaction.create({
      amount: netAmount,
      status: 'completed',
      transactionDate: new Date(),
      transactionType: 'payout',
      contractId: contractId,
      platformFee: contract.stripeApplicationFee,
      netAmount: netAmount,
    });

    // Send completion emails
    await Promise.all([
      // Email to recruiter
      sendEmail({
        from: process.env.NODEMAILER_SMTP_EMAIL,
        to: contract.recruiter.email,
        subject: 'OptaHire - Contract Completed',
        html: generateEmailTemplate({
          firstName: contract.recruiter.firstName,
          subject: 'Contract Completed Successfully',
          content: [
            {
              type: 'heading',
              value: 'Contract Completed!',
            },
            {
              type: 'text',
              value:
                'Your interview contract has been completed successfully. The interviewer has been paid.',
            },
          ],
        }),
      }),
      // Email to interviewer
      sendEmail({
        from: process.env.NODEMAILER_SMTP_EMAIL,
        to: contract.interviewer.email,
        subject: 'OptaHire - Payment Released',
        html: generateEmailTemplate({
          firstName: contract.interviewer.firstName,
          subject: 'Payment Released to Your Account',
          content: [
            {
              type: 'heading',
              value: 'Payment Released!',
            },
            {
              type: 'text',
              value: `Your contract has been completed and $${netAmount.toFixed(2)} has been transferred to your Stripe account.`,
            },
            {
              type: 'text',
              value:
                'The funds should appear in your bank account within 2-7 business days.',
            },
          ],
        }),
      }),
    ]);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Contract completed and payout processed successfully.',
      data: {
        contractId: contractId,
        status: 'completed',
        payoutAmount: netAmount,
        platformFee: contract.stripeApplicationFee,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error(`Contract completion failed: ${error.message}`);
  }
});

/**
 * @desc Get payment status for contract
 * @route GET /api/v1/payments/contracts/:contractId/status
 * @access Private
 */
const getContractPaymentStatus = asyncHandler(async (req, res) => {
  const { contractId } = req.params;
  const user = req.user;

  const contract = await Contract.findByPk(contractId, {
    include: [{ model: Transaction, as: 'transactions' }],
  });

  if (!contract) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Contract not found.');
  }

  // Check authorization
  if (
    !user.isAdmin &&
    contract.recruiterId !== user.id &&
    contract.interviewerId !== user.id
  ) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error('You are not authorized to view this contract.');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Contract payment status retrieved successfully.',
    data: {
      contractId: contractId,
      agreedPrice: contract.agreedPrice,
      paymentStatus: contract.paymentStatus,
      contractStatus: contract.status,
      platformFee: contract.stripeApplicationFee,
      transactions: contract.transactions,
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc Handle Stripe webhooks
 * @route POST /api/v1/payments/webhooks/stripe
 * @access Public (Stripe)
 */
const handleStripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent succeeded:', paymentIntent.id);
      break;

    case 'account.updated':
      const account = event.data.object;
      // Update user's Stripe account status
      await User.update(
        {
          stripeAccountStatus: account.payouts_enabled ? 'verified' : 'pending',
          payoutEnabled: account.payouts_enabled,
        },
        { where: { stripeAccountId: account.id } }
      );
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      // Update transaction status to failed
      await Transaction.update(
        { status: 'failed' },
        { where: { stripePaymentIntentId: failedPayment.id } }
      );
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

/**
 * @desc Get payout history for interviewer
 * @route GET /api/v1/payments/payouts
 * @access Private (Interviewer)
 */
const getPayoutHistory = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user.isInterviewer) {
    res.status(StatusCodes.FORBIDDEN);
    throw new Error('Only interviewers can view payout history.');
  }

  const payouts = await Transaction.findAll({
    where: {
      transactionType: 'payout',
    },
    include: [
      {
        model: Contract,
        as: 'contract',
        where: { interviewerId: user.id },
        include: [
          { model: Job, as: 'job' },
          {
            model: User,
            as: 'recruiter',
            attributes: ['firstName', 'lastName', 'email'],
          },
        ],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Payout history retrieved successfully.',
    data: {
      payouts: payouts,
      totalEarnings: payouts.reduce(
        (sum, payout) => sum + parseFloat(payout.netAmount || 0),
        0
      ),
    },
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  createStripeConnectAccount,
  getStripeConnectStatus,
  refreshStripeConnectLink,
  getStripeConnectDashboard,
  createContractPayment,
  confirmContractPayment,
  completeContractAndPayout,
  getContractPaymentStatus,
  handleStripeWebhook,
  getPayoutHistory,
};
