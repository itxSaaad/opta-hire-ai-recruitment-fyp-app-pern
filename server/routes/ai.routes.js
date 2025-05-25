const { Router } = require('express');

const {
  protectServer,
  authorizeServerRoles,
} = require('../middlewares/auth.middleware');

const {
  checkSystemHealth,
  checkAiServiceStatus,
  getModelStatus,
  getModelMetrics,
  trainModel,
  shortlistCandidates,
  previewCandidateShortlist,
} = require('../controllers/ai.controller');

const router = Router();

router.get(
  '/health/system',
  protectServer,
  authorizeServerRoles('isAdmin'),
  checkSystemHealth
);

router.get(
  '/health/ai-service',
  protectServer,
  authorizeServerRoles('isAdmin'),
  checkAiServiceStatus
);

router.get(
  '/model/status',
  protectServer,
  authorizeServerRoles('isAdmin'),
  getModelStatus
);

router.get(
  '/model/metrics',
  protectServer,
  authorizeServerRoles('isAdmin'),
  getModelMetrics
);

router.post(
  '/model/train',
  protectServer,
  authorizeServerRoles('isAdmin'),
  trainModel
);

router.post(
  '/shortlist/:jobId',
  protectServer,
  authorizeServerRoles('isAdmin', 'isRecruiter'),
  shortlistCandidates
);

router.post(
  '/shortlist/preview',
  protectServer,
  authorizeServerRoles('isAdmin', 'isRecruiter'),
  previewCandidateShortlist
);

module.exports = router;
