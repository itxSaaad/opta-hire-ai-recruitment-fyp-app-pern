const { Router } = require('express');

const {
  protectServer,
  authorizeServerRoles,
} = require('../middlewares/auth.middleware');

const {
  verifyUserEmail,
  updateUserPassword,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getAllUsersProfile,
  getUserProfileById,
  updateUserProfileById,
  deleteUserById,
  deleteUserPermById,
} = require('../controllers/user.controller');

const router = Router();

router
  .route('/')
  .get(protectServer, authorizeServerRoles('isAdmin'), getAllUsersProfile);

router.route('/verify-email').post(protectServer, verifyUserEmail);

router.route('/update-password').put(protectServer, updateUserPassword);

router
  .route('/profile')
  .get(protectServer, getUserProfile)
  .put(protectServer, updateUserProfile)
  .delete(protectServer, deleteUserProfile);

router
  .route('/:id')
  .get(protectServer, authorizeServerRoles('isAdmin'), getUserProfileById)
  .put(protectServer, authorizeServerRoles('isAdmin'), updateUserProfileById)
  .delete(protectServer, authorizeServerRoles('isAdmin'), deleteUserById);

router.delete(
  '/:id/permanent',
  protectServer,
  authorizeServerRoles('isAdmin'),
  deleteUserPermById
);

module.exports = router;
