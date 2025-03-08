const { Router } = require('express');
const { protect, authorizeRoles } = require('../middlewares/auth.middleware');

const {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  getApplicationsByJobId,
} = require('../controllers/application.controller');

const router = Router();

router
  .route('/')
  .post(protect, authorizeRoles('isCandidate'), createApplication)
  .get(protect, getAllApplications);

router
  .route('/:id')
  .get(protect, getApplicationById)
  .patch(protect, authorizeRoles('isRecruiter', 'isAdmin'), updateApplication)
  .delete(protect, authorizeRoles('isAdmin'), deleteApplication);

router.get(
  '/job/:jobId',
  protect,
  authorizeRoles('isRecruiter', 'isAdmin'),
  getApplicationsByJobId
);

module.exports = router;
