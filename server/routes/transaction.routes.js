const { Router } = require('express');

const {
  protectServer,
  authorizeServerRoles,
} = require('../middlewares/auth.middleware');

const {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  getTransactionsByContract,
  updateTransactionById,
  deleteTransactionById,
} = require('../controllers/transaction.controller');

const router = Router();

router
  .route('/')
  .get(
    protectServer,
    authorizeServerRoles('isAdmin', 'isRecruiter', 'isInterviewer'),
    getAllTransactions
  )
  .post(
    protectServer,
    authorizeServerRoles('isRecruiter', 'isInterviewer'),
    createTransaction
  );

router
  .route('/:id')
  .get(
    protectServer,
    authorizeServerRoles('isAdmin', 'isRecruiter', 'isInterviewer'),
    getTransactionById
  )
  .put(protectServer, authorizeServerRoles('isAdmin'), updateTransactionById)
  .delete(
    protectServer,
    authorizeServerRoles('isAdmin'),
    deleteTransactionById
  );

router.get(
  '/contract/:contractId',
  protectServer,
  authorizeServerRoles('isAdmin', 'isRecruiter', 'isInterviewer'),
  getTransactionsByContract
);

module.exports = router;
