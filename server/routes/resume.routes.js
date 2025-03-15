const { Router } = require('express');

const {
  protectServer,
  authorizeServerRoles,
} = require('../middlewares/auth.middleware');

const {
  createResume,
  getAllResumes,
  getResumeForUser,
  updateResume,
  deleteResume,
  updateResumeById,
  deleteResumeById,
} = require('../controllers/resume.controller');

const router = Router();

router
  .route('/')
  .post(protectServer, createResume)
  .get(protectServer, authorizeServerRoles('isAdmin'), getAllResumes);

router
  .route('/user')
  .get(protectServer, getResumeForUser)
  .put(protectServer, updateResume)
  .delete(protectServer, deleteResume);

router
  .route('/:id')
  .put(protectServer, authorizeServerRoles('isAdmin'), updateResumeById)
  .delete(protectServer, authorizeServerRoles('isAdmin'), deleteResumeById);

module.exports = router;
