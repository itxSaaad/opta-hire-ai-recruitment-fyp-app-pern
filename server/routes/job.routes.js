const { Router } = require('express');
const { protect, authorizeRoles } = require('../middlewares/auth.middleware');

const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
} = require('../controllers/job.controller');

const router = Router();

router
  .route('/')
  .post(protect, authorizeRoles('isRecruiter'), createJob)
  .get(getAllJobs);

router
  .route('/:id')
  .get(getJobById)
  .patch(protect, authorizeRoles('isRecruiter', 'isAdmin'), updateJob)
  .delete(protect, authorizeRoles('isAdmin'), deleteJob);

module.exports = router;
