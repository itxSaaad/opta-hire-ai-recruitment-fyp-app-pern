const { Router } = require('express');

const {
  protectServer,
  authorizeServerRoles,
} = require('../middlewares/auth.middleware');

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
  .post(protectServer, authorizeServerRoles('isCandidate'), createApplication)
  .get(protectServer, getAllApplications);

router
  .route('/:id')
  .get(protectServer, getApplicationById)
  .patch(
    protectServer,
    authorizeServerRoles('isRecruiter', 'isAdmin'),
    updateApplication
  )
  .delete(protectServer, authorizeServerRoles('isAdmin'), deleteApplication);

router.get('/job/:jobId', protectServer, getApplicationsByJobId);

module.exports = router;
