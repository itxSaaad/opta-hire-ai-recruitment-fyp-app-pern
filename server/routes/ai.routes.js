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
  authorizeServerRoles('isAdmin', 'isRecruiter'),
  checkSystemHealth
);

router.get(
  '/health/ai-service',
  protectServer,
  authorizeServerRoles('isAdmin', 'isRecruiter'),
  checkAiServiceStatus
);

router.get(
  '/model/status',
  protectServer,
  authorizeServerRoles('isAdmin', 'isRecruiter'),
  getModelStatus
);

router.get(
  '/model/metrics',
  protectServer,
  authorizeServerRoles('isAdmin', 'isRecruiter'),
  getModelMetrics
);

router.post(
  '/model/train',
  protectServer,
  authorizeServerRoles('isAdmin', 'isRecruiter'),
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
