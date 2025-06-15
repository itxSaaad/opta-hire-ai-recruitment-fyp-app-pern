import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaCalendarAlt,
  FaDollarSign,
  FaPencilAlt,
  FaSave,
  FaTimes,
  FaTrash,
} from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import Table from '../../components/ui/dashboardLayout/Table';
import InputField from '../../components/ui/mainLayout/InputField';

import { trackEvent, trackPageView } from '../../utils/analytics';

import {
  useDeleteTransactionMutation,
  useGetAllTransactionsQuery,
  useUpdateTransactionMutation,
} from '../../features/transaction/transactionApi';

export default function TransactionsScreen() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');

  const routeLocation = useLocation();

  const {
    data: transactionsData,
    isLoading,
    error,
    refetch,
  } = useGetAllTransactionsQuery();
  const [
    updateTransaction,
    { isLoading: isUpdating, error: updateError, data: updateData },
  ] = useUpdateTransactionMutation();
  const [
    deleteTransaction,
    { isLoading: isDeleting, error: deleteError, data: deleteData },
  ] = useDeleteTransactionMutation();

  useEffect(() => {
    trackPageView(routeLocation.pathname);
  }, [routeLocation.pathname]);

  useEffect(() => {
    if (selectedTransaction) {
      setAmount(selectedTransaction.amount);
      setStatus(selectedTransaction.status);
    }
  }, [selectedTransaction]);

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setShowEditModal(true);
    trackEvent(
      'Edit Transaction',
      'User Action',
      `Clicked edit on transaction ${transaction.id}`
    );
  };

  const handleDelete = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDeleteModal(true);
    trackEvent(
      'Delete Transaction',
      'User Action',
      `Clicked delete on transaction ${transaction.id}`
    );
  };

  const saveTransactionChanges = async () => {
    try {
      await updateTransaction({
        id: selectedTransaction.id,
        transactionData: { amount, status },
      }).unwrap();
      setShowEditModal(false);
      refetch();
      trackEvent(
        'Update Transaction',
        'User Action',
        `Updated transaction ${selectedTransaction.id}`
      );
    } catch (err) {
      console.error('Update failed:', err);
      trackEvent(
        'Update Transaction Failed',
        'User Action',
        `Failed update ${selectedTransaction.id}`
      );
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteTransaction(selectedTransaction.id).unwrap();
      setShowDeleteModal(false);
      refetch();
      trackEvent(
        'Delete Transaction Confirmed',
        'User Action',
        `Deleted ${selectedTransaction.id}`
      );
    } catch (err) {
      console.error('Deletion failed:', err);
      trackEvent(
        'Delete Transaction Failed',
        'User Action',
        `Failed delete ${selectedTransaction.id}`
      );
    }
  };

  const columns = [
    { key: 'id', label: 'Transaction ID' },
    {
      key: 'contract',
      label: 'Contract ID',
      render: (tx) => tx.contractId,
    },
    {
      key: 'recruiter',
      label: 'Recruiter',
      render: (tx) =>
        `${tx.contract.recruiter.firstName} ${tx.contract.recruiter.lastName}`,
    },
    {
      key: 'interviewer',
      label: 'Interviewer',
      render: (tx) =>
        `${tx.contract.interviewer.firstName} ${tx.contract.interviewer.lastName}`,
    },
    {
      key: 'transactionType',
      label: 'Type',
      render: (tx) => {
        const typeMap = {
          payment: 'Contract Payment',
          refund: 'Payment Refund',
          payout: 'Interviewer Payout',
          platform_fee: 'Platform Fee',
        };
        return typeMap[tx.transactionType] || tx.transactionType;
      },
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (tx) => (
        <span className="flex items-center gap-1">
          <FaDollarSign /> {tx.amount}
        </span>
      ),
    },
    {
      key: 'platformFee',
      label: 'Platform Fee',
      render: (tx) =>
        tx.platformFee && (
          <span className="flex items-center gap-1">
            <FaDollarSign /> {tx.platformFee}
          </span>
        ),
    },
    {
      key: 'netAmount',
      label: 'Net Amount',
      render: (tx) =>
        tx.netAmount && (
          <span className="flex items-center gap-1">
            <FaDollarSign /> {tx.netAmount}
          </span>
        ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (tx) => (
        <span
          className={`rounded px-2.5 py-0.5 text-xs font-medium ${
            tx.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : tx.status === 'completed'
                ? 'bg-green-100 text-green-800'
                : tx.status === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : tx.status === 'cancelled'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-blue-100 text-blue-800'
          }`}
        >
          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
        </span>
      ),
    },
    {
      key: 'transactionDate',
      label: 'Date',
      render: (tx) => (
        <span className="flex items-center gap-1">
          <FaCalendarAlt /> {new Date(tx.transactionDate).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const actions = [
    {
      onClick: handleEdit,
      render: () => (
        <button className="flex items-center gap-1 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600">
          <FaPencilAlt />
          Edit
        </button>
      ),
    },
    {
      onClick: handleDelete,
      render: () => (
        <button className="flex items-center gap-1 rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700">
          <FaTrash />
          Delete
        </button>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>
          Transaction Management [Admin] - OptaHire | Monitor All Payments
        </title>
        <meta
          name="description"
          content="OptaHire Transaction Management - Monitor all platform transactions, payments, and financial activities with detailed analytics."
        />
        <meta
          name="keywords"
          content="OptaHire Transaction Management, Payment Monitoring, Financial Analytics, Admin Transactions"
        />
      </Helmet>

      <section className="flex min-h-screen animate-fadeIn flex-col items-center bg-light-background px-4 py-24 dark:bg-dark-background">
        {isLoading ? (
          <div className="relative w-full max-w-sm animate-fadeIn sm:max-w-md">
            <Loader />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-7xl animate-slideUp">
            <h1 className="mb-6 text-center text-3xl font-bold text-light-text dark:text-dark-text sm:text-4xl md:text-5xl">
              Manage{' '}
              <span className="text-light-primary dark:text-dark-primary">
                Transactions
              </span>
            </h1>
            <p className="mb-8 text-center text-lg text-light-text/70 dark:text-dark-text/70">
              Monitor all platform transactions, payments, and financial
              activities with comprehensive security and analytics.
            </p>

            {(error || updateError || deleteError) && (
              <Alert
                message={
                  error?.data?.message ||
                  updateError?.data?.message ||
                  deleteError?.data?.message
                }
              />
            )}

            {(!updateData?.success && updateData?.message) ||
            (!deleteData?.success && deleteData?.message) ? (
              <Alert
                message={updateData?.message || deleteData?.message}
                isSuccess={false}
              />
            ) : null}

            {updateData?.message && updateData.success && (
              <Alert
                message={updateData?.message}
                isSuccess={updateData?.success}
              />
            )}

            {deleteData?.message && deleteData?.success && (
              <Alert
                message={deleteData?.message}
                isSuccess={deleteData?.success}
              />
            )}

            <Table
              columns={columns}
              data={transactionsData?.transactions || []}
              actions={actions}
            />
          </div>
        )}
      </section>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Transaction"
      >
        {isUpdating ? (
          <Loader />
        ) : (
          <div className="space-y-4">
            <InputField
              id="amount"
              type="number"
              label="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <InputField
              id="status"
              type="select"
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'completed', label: 'Completed' },
                { value: 'failed', label: 'Failed' },
                { value: 'cancelled', label: 'Cancelled' },
                { value: 'refunded', label: 'Refunded' },
              ]}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <button
                className="flex items-center gap-2 rounded bg-gray-300 px-4 py-2 text-gray-800 transition-all duration-200 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                onClick={() => setShowEditModal(false)}
                disabled={isUpdating}
              >
                <FaTimes />
                Cancel
              </button>
              <button
                className="flex items-center gap-2 rounded bg-light-primary px-4 py-2 text-white transition-all duration-200 hover:bg-light-secondary dark:bg-dark-primary dark:hover:bg-dark-secondary"
                onClick={saveTransactionChanges}
                disabled={isUpdating}
              >
                <FaSave />
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Transaction Deletion"
      >
        {isDeleting ? (
          <Loader />
        ) : (
          <div>
            <p className="mb-6 text-light-text dark:text-dark-text">
              Are you sure you want to delete this transaction? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="rounded bg-gray-300 px-4 py-2 text-gray-800 transition-all duration-200 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-white transition-all duration-200 hover:bg-red-700"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                <FaTrash />
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
