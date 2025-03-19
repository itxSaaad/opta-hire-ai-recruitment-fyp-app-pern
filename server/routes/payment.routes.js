const { Router } = require('express');

const {
  protectServer,
  authorizeServerRoles,
} = require('../middlewares/auth.middleware');

const {
  createCheckoutSession,
  capturePayment,
  completeContractPayment,
} = require('../controllers/payment.controller');

const router = Router();

router.post(
  '/checkout-session/:contractId',
  protectServer,
  authorizeServerRoles('isRecruiter'),
  createCheckoutSession
);

router.post(
  '/capture/:contractId',
  protectServer,
  authorizeServerRoles('isInterviewer'),
  capturePayment
);

router.post(
  '/complete/:contractId',
  protectServer,
  authorizeServerRoles('isRecruiter'),
  completeContractPayment
);

module.exports = router;
