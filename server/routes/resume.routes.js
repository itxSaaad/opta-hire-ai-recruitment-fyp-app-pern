const { Router } = require('express');

const { protect, authorizeRoles } = require('../middlewares/auth.middleware');

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
  .post(protect, createUserResume)
  .get(protect, authorizeRoles('isAdmin'), getAllUserResumes);

router
  .route('/user')
  .get(protect, getUserResume)
  .put(protect, updateUserResume)
  .delete(protect, deleteUserResume);

module.exports = router;
