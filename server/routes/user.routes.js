const { Router } = require('express');

const { protect, authorizeRoles } = require('../middlewares/auth.middleware');

const {
  loginUser,
  registerUser,
  getUserProfile,
  resetPassword,
  updateUserProfile,
  deleteUser,
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  deleteUserPermById,
} = require('../controllers/user.controllers');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management operations
 */
const router = Router();

router.route('/').get(protect, authorizeRoles('admin'), getUsers);

router.route('/login').post(loginUser);

router.route('/register').post(registerUser);

router.route('/reset-password').post(resetPassword);

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .delete(protect, deleteUser);

router
  .route('/:id')
  .get(protect, authorizeRoles('admin'), getUserById)
  .put(protect, authorizeRoles('admin'), updateUserById)
  .delete(protect, authorizeRoles('admin'), deleteUserById);

router.delete(
  '/:id/permanent',
  protect,
  authorizeRoles('admin'),
  deleteUserPermById
);

module.exports = router;
