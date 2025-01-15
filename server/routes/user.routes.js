const { Router } = require('express');

const { protect, authorizeRoles } = require('../middlewares/auth.middleware');

const {
  getUserProfile,
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

router.route('/').get(protect, authorizeRoles('isAdmin'), getUsers);

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .delete(protect, deleteUser);

router
  .route('/:id')
  .get(protect, authorizeRoles('isAdmin'), getUserById)
  .put(protect, authorizeRoles('isAdmin'), updateUserById)
  .delete(protect, authorizeRoles('isAdmin'), deleteUserById);

router.delete(
  '/:id/permanent',
  protect,
  authorizeRoles('isAdmin'),
  deleteUserPermById
);

module.exports = router;
