import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaDollarSign,
  FaCalendarAlt,
  FaPencilAlt,
  FaTrash,
  FaTimes,
  FaSave,
} from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import Table from '../../components/ui/dashboardLayout/Table';
import InputField from '../../components/ui/mainLayout/InputField';

import { trackEvent, trackPageView } from '../../utils/analytics';

import {
  useGetAllTransactionsQuery,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
} from '../../features/transaction/transactionApi';

export default function TransactionsScreen() {
  const location = useLocation();

  const { data, isLoading, error, refetch } = useGetAllTransactionsQuery();
  const [updateTransaction, { isLoading: isUpdating, error: updateError }] =
    useUpdateTransactionMutation();
  const [deleteTransaction, { isLoading: isDeleting, error: deleteError }] =
    useDeleteTransactionMutation();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (selectedTx) {
      setAmount(selectedTx.amount);
      setStatus(selectedTx.status);
    }
  }, [selectedTx]);

  const handleEdit = (tx) => {
    setSelectedTx(tx);
    setShowEditModal(true);
    trackEvent(
      'Edit Transaction',
      'User Action',
      `Clicked edit on transaction ${tx.id}`
    );
  };

  const handleDelete = (tx) => {
    setSelectedTx(tx);
    setShowDeleteModal(true);
    trackEvent(
      'Delete Transaction',
      'User Action',
      `Clicked delete on transaction ${tx.id}`
    );
  };

  const saveChanges = async () => {
    try {
      await updateTransaction({
        id: selectedTx.id,
        transactionData: { amount, status },
      }).unwrap();
      setShowEditModal(false);
      refetch();
      trackEvent(
        'Update Transaction',
        'User Action',
        `Updated transaction ${selectedTx.id}`
      );
    } catch (err) {
      console.error(err);
      trackEvent(
        'Update Transaction Failed',
        'User Action',
        `Failed update ${selectedTx.id}`
      );
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteTransaction(selectedTx.id).unwrap();
      setShowDeleteModal(false);
      refetch();
      trackEvent(
        'Delete Transaction Confirmed',
        'User Action',
        `Deleted ${selectedTx.id}`
      );
    } catch (err) {
      console.error(err);
      trackEvent(
        'Delete Transaction Failed',
        'User Action',
        `Failed delete ${selectedTx.id}`
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
      key: 'amount',
      label: 'Amount',
      render: (tx) => (
        <span className="flex items-center gap-1">
          <FaDollarSign /> {tx.amount}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (tx) => (
        <span
          className={`text-xs font-medium px-2.5 py-0.5 rounded ${
            tx.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : tx.status === 'completed'
                ? 'bg-green-100 text-green-800'
                : tx.status === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
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
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1">
          <FaPencilAlt /> Edit
        </button>
      ),
    },
    {
      onClick: handleDelete,
      render: () => (
        <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center gap-1">
          <FaTrash /> Delete
        </button>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>Transactions Management [Admin] - OptaHire</title>
        <meta
          name="description"
          content="Manage all transactions efficiently with OptaHire Admin."
        />
        <meta
          name="keywords"
          content="OptaHire, Transactions, Admin, Dashboard"
        />
      </Helmet>

      <section className="min-h-screen flex flex-col items-center py-24 px-4 bg-light-background dark:bg-dark-background animate-fadeIn">
        <div className="w-full max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-light-text dark:text-dark-text">
            Transactions Management
          </h1>

          {isLoading ? (
            <div className="w-full max-w-sm mx-auto">
              <Loader />
            </div>
          ) : error ? (
            <Alert
              isSuccess={false}
              message={error.data?.message || 'Failed to fetch transactions'}
            />
          ) : (
            <Table
              columns={columns}
              data={data?.transactions || []}
              actions={actions}
            />
          )}
        </div>
      </section>

      {/* Edit Transaction Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Transaction"
      >
        {isUpdating ? (
          <Loader />
        ) : (
          <div className="space-y-4">
            {updateError && (
              <Alert
                isSuccess={false}
                message={
                  updateError.data?.message || 'Failed to update transaction'
                }
              />
            )}
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
              ]}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition"
              >
                <FaTimes /> Cancel
              </button>
              <button
                onClick={saveChanges}
                className="flex items-center gap-2 px-4 py-2 bg-light-primary dark:bg-dark-primary text-white rounded hover:bg-light-secondary dark:hover:bg-dark-secondary transition"
              >
                <FaSave /> Save
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Transaction Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Deletion"
      >
        {isDeleting ? (
          <Loader />
        ) : (
          <div>
            {deleteError && (
              <Alert
                isSuccess={false}
                message={
                  deleteError.data?.message || 'Failed to delete transaction'
                }
              />
            )}
            <p className="mb-6 text-light-text dark:text-dark-text">
              Are you sure you want to delete transaction “{selectedTx?.id}”?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition flex items-center gap-2"
              >
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
