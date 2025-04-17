import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaPencilAlt, FaSave, FaTimes, FaTrash } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import Table from '../../components/ui/dashboardLayout/Table';
import InputField from '../../components/ui/mainLayout/InputField';

import { trackEvent, trackPageView } from '../../utils/analytics';

import {
  useGetAllContractsQuery,
  useUpdateContractByIdMutation,
  useDeleteContractByIdMutation,
} from '../../features/contract/contractApi';

export default function ContractsScreen() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);

  const [agreedPrice, setAgreedPrice] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  const routeLocation = useLocation();

  const {
    data: contractsData,
    isLoading,
    error,
    refetch,
  } = useGetAllContractsQuery();
  const [updateContractById, { isLoading: isUpdating, error: updateError }] =
    useUpdateContractByIdMutation();
  const [deleteContractById, { isLoading: isDeleting, error: deleteError }] =
    useDeleteContractByIdMutation();

  useEffect(() => {
    trackPageView(routeLocation.pathname);
  }, [routeLocation.pathname]);

  useEffect(() => {
    if (selectedContract) {
      setAgreedPrice(selectedContract.agreedPrice);
      setStatus(selectedContract.status);
      setPaymentStatus(selectedContract.paymentStatus);
    }
  }, [selectedContract]);

  const handleEdit = (contract) => {
    setSelectedContract(contract);
    setShowEditModal(true);
    trackEvent(
      'Edit Contract',
      'User Action',
      'User clicked on edit contract button'
    );
  };

  const handleDelete = (contract) => {
    setSelectedContract(contract);
    setShowDeleteModal(true);
    trackEvent(
      'Delete Contract',
      'User Action',
      'User clicked on delete contract button'
    );
  };

  const confirmDelete = async () => {
    try {
      await deleteContractById(selectedContract.id).unwrap();
      setShowDeleteModal(false);
      refetch();
      trackEvent(
        'Delete Contract Confirmed',
        'User Action',
        `User confirmed deletion of contract ${selectedContract.id}`
      );
    } catch (err) {
      console.error('Deletion failed:', err);
      trackEvent(
        'Delete Contract Failed',
        'User Action',
        `User failed to delete contract ${selectedContract.id}`
      );
    }
  };

  const saveContractChanges = async () => {
    try {
      await updateContractById({
        id: selectedContract.id,
        contractData: {
          agreedPrice,
          status,
          paymentStatus,
        },
      }).unwrap();

      setShowEditModal(false);
      refetch();
      trackEvent(
        'Update Contract',
        'User Action',
        `User updated contract ${selectedContract.id}`
      );
    } catch (err) {
      console.error('Update failed:', err);
      trackEvent(
        'Update Contract Failed',
        'User Action',
        `User failed to update contract ${selectedContract.id}`
      );
    }
  };

  const columns = [
    {
      key: 'jobTitle',
      label: 'Job Title',
      render: (contract) => contract.job.title,
    },
    {
      key: 'recruiter',
      label: 'Recruiter',
      render: (contract) =>
        `${contract.recruiter.firstName} ${contract.recruiter.lastName}`,
    },
    {
      key: 'interviewer',
      label: 'Interviewer',
      render: (contract) =>
        `${contract.interviewer.firstName} ${contract.interviewer.lastName}`,
    },
    {
      key: 'agreedPrice',
      label: 'Agreed Price',
      render: (contract) => `$${contract.agreedPrice}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (contract) => (
        <span
          className={`text-xs font-medium px-2.5 py-0.5 rounded ${
            contract.status === 'pending'
              ? 'bg-blue-100 text-blue-800'
              : contract.status === 'active'
                ? 'bg-green-100 text-green-800'
                : contract.status === 'completed'
                  ? 'bg-teal-100 text-teal-800'
                  : contract.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
          }`}
        >
          {contract.status.charAt(0).toUpperCase() +
            contract.status.slice(1).toLowerCase()}
        </span>
      ),
    },
    {
      key: 'paymentStatus',
      label: 'Payment Status',
      render: (contract) => (
        <span
          className={`text-xs font-medium px-2.5 py-0.5 rounded ${
            contract.paymentStatus === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : contract.paymentStatus === 'paid'
                ? 'bg-green-100 text-green-800'
                : contract.paymentStatus === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : contract.paymentStatus === 'refunded'
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-gray-100 text-gray-800'
          }`}
        >
          {contract.paymentStatus.charAt(0).toUpperCase() +
            contract.paymentStatus.slice(1).toLowerCase()}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (contract) => new Date(contract.createdAt).toLocaleDateString(),
    },
  ];

  const actions = [
    {
      onClick: handleEdit,
      render: () => (
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1">
          <FaPencilAlt />
          Edit
        </button>
      ),
    },
    {
      onClick: handleDelete,
      render: () => (
        <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center gap-1">
          <FaTrash />
          Delete
        </button>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>Contracts Management [Admin] - OptaHire</title>
        <meta
          name="description"
          content="OptaHire Admin Contracts Management - Manage and monitor all contracts seamlessly."
        />
        <meta
          name="keywords"
          content="OptaHire, Contracts, Recruitment, Administration"
        />
      </Helmet>

      <section className="min-h-screen flex flex-col items-center py-24 px-4 bg-light-background dark:bg-dark-background animate-fadeIn">
        {isLoading ? (
          <div className="w-full max-w-sm sm:max-w-md relative animate-fadeIn">
            <Loader />
          </div>
        ) : (
          <div className="w-full max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-light-text dark:text-dark-text">
              Contracts Management
            </h1>

            {error && <Alert message={error.data.message} />}

            <Table
              columns={columns}
              data={contractsData?.contracts || []}
              actions={actions}
            />
          </div>
        )}
      </section>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Contract"
      >
        {isUpdating ? (
          <Loader />
        ) : (
          <div className="space-y-4">
            {updateError && <Alert message={updateError.data.message} />}
            <InputField
              id="agreedPrice"
              type="text"
              label="Agreed Price"
              value={agreedPrice}
              onChange={(e) => setAgreedPrice(e.target.value)}
              placeholder="Enter agreed price"
            />
            <InputField
              id="status"
              type="select"
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'active', label: 'Active' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
            <InputField
              id="paymentStatus"
              type="select"
              label="Payment Status"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'paid', label: 'Paid' },
                { value: 'failed', label: 'Failed' },
                { value: 'refunded', label: 'Refunded' },
              ]}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-all duration-200"
                onClick={() => setShowEditModal(false)}
                disabled={isUpdating}
              >
                <FaTimes />
                Cancel
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-light-primary dark:bg-dark-primary hover:bg-light-secondary dark:hover:bg-dark-secondary text-white rounded transition-all duration-200"
                onClick={saveContractChanges}
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
        title="Confirm Contract Deletion"
      >
        {isDeleting ? (
          <Loader />
        ) : (
          <div>
            {deleteError && <Alert message={deleteError.data.message} />}
            <p className="mb-6 text-light-text dark:text-dark-text">
              Are you sure you want to delete this contract? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-all duration-200"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-all duration-200 flex items-center gap-2"
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
