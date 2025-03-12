const { Router } = require('express');
const {
    protectServer,
    authorizeServerRoles,
} = require('../middlewares/auth.middleware');

const {
    createInterview,
    getInterviews,
    getInterviewById,
    updateInterview,
    deleteInterview,
} = require('../controllers/interview.controller');

const router = Router();

router
    .route('/')
    .post(protectServer, authorizeServerRoles('isAdmin', 'isInterviewer'), createInterview)
    .get(protectServer, authorizeServerRoles('isAdmin', 'isInterviewer', 'isCandidate'), getInterviews);

router
    .route('/:id')
    .get(protectServer, authorizeServerRoles('isAdmin', 'isInterviewer', 'isCandidate'), getInterviewById)
    .put(protectServer, authorizeServerRoles('isAdmin', 'isInterviewer'), updateInterview)
    .delete(protectServer, authorizeServerRoles('isAdmin', 'isInterviewer'), deleteInterview);

module.exports = router;