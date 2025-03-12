const { Router } = require('express');

const {
  protectServer,
  authorizeServerRoles,
} = require('../middlewares/auth.middleware');

const {
  createUserResume,
  getUserResume,
  updateUserResume,
  deleteUserResume,
  getAllUserResumes,
} = require('../controllers/resume.controller');

const router = Router();

router
  .route('/')
  .post(protectServer, createUserResume)
  .get(protectServer, authorizeServerRoles('isAdmin'), getAllUserResumes);

router
  .route('/user')
  .get(protectServer, getUserResume)
  .put(protectServer, updateUserResume)
  .delete(protectServer, deleteUserResume);

module.exports = router;
