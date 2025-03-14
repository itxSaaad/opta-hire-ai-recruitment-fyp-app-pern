const { Router } = require('express');

const {
  protectServer,
  authorizeServerRoles,
} = require('../middlewares/auth.middleware');

const {
  createInterview,
  getAllInterviews,
  getInterviewById,
  getInterviewsByJobId,
  updateInterview,
  deleteInterview,
} = require('../controllers/interview.controller');

const router = Router();

router
  .route('/')
  .post(protectServer, authorizeServerRoles('isInterviewer'), createInterview)
  .get(protectServer, getAllInterviews);

router
  .route('/:id')
  .get(protectServer, getInterviewById)
  .put(
    protectServer,
    authorizeServerRoles('isInterviewer', 'isAdmin'),
    updateInterview
  )
  .delete(protectServer, authorizeServerRoles('isAdmin'), deleteInterview);

router
  .route('/job/:jobId')
  .get(
    protectServer,
    authorizeServerRoles('isInterviewer', 'isRecruiter', 'isAdmin'),
    getInterviewsByJobId
  );

module.exports = router;
