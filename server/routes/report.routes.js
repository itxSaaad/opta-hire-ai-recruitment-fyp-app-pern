const { Router } = require('express');

const {
  protectServer,
  authorizeServerRoles,
} = require('../middlewares/auth.middleware');

const {
  getUserActivityReport,
  getJobPerformanceReport,
  getFinancialReport,
  getInterviewAnalyticsReport,
  getApplicationFunnelReport,
} = require('../controllers/report.controller');

const router = Router();

router.get(
  '/user-activity',
  protectServer,
  authorizeServerRoles('isAdmin'),
  getUserActivityReport
);

router.get(
  '/job-performance',
  protectServer,
  authorizeServerRoles('isAdmin'),
  getJobPerformanceReport
);

router.get(
  '/financial',
  protectServer,
  authorizeServerRoles('isAdmin'),
  getFinancialReport
);

router.get(
  '/interview-analytics',
  protectServer,
  authorizeServerRoles('isAdmin'),
  getInterviewAnalyticsReport
);

router.get(
  '/application-funnel',
  protectServer,
  authorizeServerRoles('isAdmin'),
  getApplicationFunnelReport
);

module.exports = router;
