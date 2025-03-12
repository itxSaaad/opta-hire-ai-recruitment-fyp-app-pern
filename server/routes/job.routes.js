const { Router } = require('express');
const {
  protectServer,
  authorizeServerRoles,
} = require('../middlewares/auth.middleware');

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
  .post(protectServer, authorizeServerRoles('isRecruiter'), createJob)
  .get(getAllJobs);

router
  .route('/:id')
  .get(getJobById)
  .patch(
    protectServer,
    authorizeServerRoles('isRecruiter', 'isAdmin'),
    updateJob
  )
  .delete(protectServer, authorizeServerRoles('isAdmin'), deleteJob);

module.exports = router;
