const { Router } = require('express');
const rateLimiter = require('express-rate-limit');

const {
  protectServer,
  authorizeServerRoles,
} = require('../middlewares/auth.middleware');

const {
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
  getContractPayoutStatus,
} = require('../controllers/payment.controller');

const router = Router();

const paymentLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 payment requests per windowMs
  message: 'Too many payment requests from this IP, please try again later.',
  handler: (req, res, next, options) => {
    res.status(429).json({
      success: false,
      message:
        'Too many payment requests from this IP, please try again later.',
      timestamp: new Date().toISOString(),
    });
  },
  standardHeaders: true,
  legacyHeaders: true,
});

router
  .route('/connect/onboard')
  .post(
    protectServer,
    authorizeServerRoles('isInterviewer'),
    paymentLimiter,
    createStripeConnectAccount
  );

router
  .route('/connect/status')
  .get(
    protectServer,
    authorizeServerRoles('isInterviewer'),
    getStripeConnectStatus
  );

router
  .route('/connect/refresh')
  .post(
    protectServer,
    authorizeServerRoles('isInterviewer'),
    paymentLimiter,
    refreshStripeConnectLink
  );

router
  .route('/connect/dashboard')
  .get(
    protectServer,
    authorizeServerRoles('isInterviewer'),
    getStripeConnectDashboard
  );

router
  .route('/contracts/:contractId/pay')
  .post(
    protectServer,
    authorizeServerRoles('isRecruiter'),
    paymentLimiter,
    createContractPayment
  );

router
  .route('/contracts/:contractId/confirm')
  .post(
    protectServer,
    authorizeServerRoles('isRecruiter'),
    paymentLimiter,
    confirmContractPayment
  );

router
  .route('/contracts/:contractId/complete')
  .post(
    protectServer,
    authorizeServerRoles('isInterviewer', 'isRecruiter', 'isAdmin'),
    completeContractAndPayout
  );

router
  .route('/contracts/:contractId/status')
  .get(
    protectServer,
    authorizeServerRoles('isInterviewer', 'isRecruiter', 'isAdmin'),
    getContractPaymentStatus
  );

router
  .route('/contracts/:contractId/payout-status')
  .get(
    protectServer,
    authorizeServerRoles('isInterviewer', 'isRecruiter', 'isAdmin'),
    getContractPayoutStatus
  );

router
  .route('/payouts')
  .get(protectServer, authorizeServerRoles('isInterviewer'), getPayoutHistory);

router.route('/webhooks/stripe').post(handleStripeWebhook);

module.exports = router;
