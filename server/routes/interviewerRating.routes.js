const { Router } = require('express');

const {
  protectServer,
  authorizeServerRoles,
} = require('../middlewares/auth.middleware');

const {
  createInterviewerRating,
  getAllInterviewerRatings,
  getInterviewerRatingById,
  updateInterviewerRating,
  deleteInterviewerRating,
  getInterviewerRatingsByJob,
  getInterviewerRatingsByContract,
} = require('../controllers/interviewerRating.controller');

const router = Router();

router
  .route('/')
  .post(
    protectServer,
    authorizeServerRoles('isRecruiter', 'isAdmin'),
    createInterviewerRating
  )
  .get(
    protectServer,
    authorizeServerRoles('isRecruiter', 'isInterviewer', 'isAdmin'),
    getAllInterviewerRatings
  );

router
  .route('/:id')
  .get(
    protectServer,
    authorizeServerRoles('isRecruiter', 'isAdmin', 'isInterviewer'),
    getInterviewerRatingById
  )
  .put(
    protectServer,
    authorizeServerRoles('isRecruiter', 'isAdmin'),
    updateInterviewerRating
  )
  .delete(
    protectServer,
    authorizeServerRoles('isAdmin'),
    deleteInterviewerRating
  );

router.get(
  '/job/:jobId',
  protectServer,
  authorizeServerRoles('isRecruiter', 'isAdmin', 'isInterviewer'),
  getInterviewerRatingsByJob
);

router.get(
  '/contract/:contractId',
  protectServer,
  authorizeServerRoles('isRecruiter', 'isAdmin', 'isInterviewer'),
  getInterviewerRatingsByContract
);

module.exports = router;
