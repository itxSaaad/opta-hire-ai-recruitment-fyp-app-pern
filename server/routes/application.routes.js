const { Router } = require('express');
const { protect, authorizeRoles } = require('../middlewares/auth.middleware');

const {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  getCandidateApplications,
  getJobApplications,
} = require('../controllers/application.controller');

const router = Router();

router
  .route('/')
  .post(protect, authorizeRoles('isCandidate'), createApplication)
  .get(protect, authorizeRoles('isRecruiter', 'isAdmin'), getAllApplications);

router
  .route('/:id')
  .get(protect, getApplicationById)
  .patch(protect, authorizeRoles('isRecruiter', 'isAdmin'), updateApplication)
  .delete(protect, authorizeRoles('isAdmin'), deleteApplication);

router.get(
  '/candidate',
  protect,
  authorizeRoles('isCandidate'),
  getCandidateApplications
);

router.get(
  '/applications/job/:jobId',
  protect,
  authorizeRoles('isRecruiter', 'isAdmin'),
  getJobApplications
);

module.exports = router;
