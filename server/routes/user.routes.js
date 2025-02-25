const { Router } = require('express');

const { protect, authorizeRoles } = require('../middlewares/auth.middleware');

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

router.route('/').get(protect, authorizeRoles('isAdmin'), getAllUsersProfile);

router.route('/verify-email').post(protect, verifyUserEmail);

router.route('/update-password').put(protect, updateUserPassword);

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .delete(protect, deleteUserProfile);

router
  .route('/:id')
  .get(protect, authorizeRoles('isAdmin'), getUserProfileById)
  .put(protect, authorizeRoles('isAdmin'), updateUserProfileById)
  .delete(protect, authorizeRoles('isAdmin'), deleteUserById);

router.delete(
  '/:id/permanent',
  protect,
  authorizeRoles('isAdmin'),
  deleteUserPermById
);

module.exports = router;
