const { Router } = require('express');

const {
  protectServer,
  authorizeServerRoles,
} = require('../middlewares/auth.middleware');

const {
  createContract,
  getAllContracts,
  getContractById,
  updateContractById,
  deleteContractById,
  getContractsByJobId,
} = require('../controllers/contract.controller');

const router = Router();

router
  .route('/')
  .post(
    protectServer,
    authorizeServerRoles('isRecruiter', 'isAdmin'),
    createContract
  )
  .get(
    protectServer,
    authorizeServerRoles('isAdmin', 'isRecruiter', 'isInterviewer'),
    getAllContracts
  );

router
  .route('/:id')
  .get(
    protectServer,
    authorizeServerRoles('isRecruiter', 'isInterviewer', 'isAdmin'),
    getContractById
  )
  .put(
    protectServer,
    authorizeServerRoles('isRecruiter', 'isInterviewer', 'isAdmin'),
    updateContractById
  )
  .delete(protectServer, authorizeServerRoles('isAdmin'), deleteContractById);

router.get(
  '/job/:jobId',
  protectServer,
  authorizeServerRoles('isRecruiter', 'isInterviewer', 'isAdmin'),
  getContractsByJobId
);

module.exports = router;
