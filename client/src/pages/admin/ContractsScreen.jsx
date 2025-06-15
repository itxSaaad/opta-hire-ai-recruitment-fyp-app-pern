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
  useDeleteContractByIdMutation,
  useGetAllContractsQuery,
  useUpdateContractByIdMutation,
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
  const [
    updateContractById,
    { isLoading: isUpdating, error: updateError, data: updateData },
  ] = useUpdateContractByIdMutation();
  const [
    deleteContractById,
    { isLoading: isDeleting, error: deleteError, data: deleteData },
  ] = useDeleteContractByIdMutation();

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
          className={`rounded px-2.5 py-0.5 text-xs font-medium ${
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
          className={`rounded px-2.5 py-0.5 text-xs font-medium ${
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
          Contract Management [Admin] - OptaHire | Monitor Interviewer Contracts
        </title>
        <meta
          name="description"
          content="OptaHire Contract Management - Oversee all interviewer-recruiter contracts, payments, and transaction security on the platform."
        />
        <meta
          name="keywords"
          content="OptaHire Contract Management, Admin Contracts, Payment Management, Interviewer Contracts"
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
                Contracts
              </span>
            </h1>
            <p className="mb-8 text-center text-lg text-light-text/70 dark:text-dark-text/70">
              Monitor all interviewer-recruiter contracts, ensure secure
              payments, and maintain platform transaction integrity.
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
                message={
                  updateData?.message ||
                  deleteData?.message ||
                  'An error occurred. Please try again.'
                }
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
                className="flex items-center gap-2 rounded bg-gray-300 px-4 py-2 text-gray-800 transition-all duration-200 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                onClick={() => setShowEditModal(false)}
                disabled={isUpdating}
              >
                <FaTimes />
                Cancel
              </button>
              <button
                className="flex items-center gap-2 rounded bg-light-primary px-4 py-2 text-white transition-all duration-200 hover:bg-light-secondary dark:bg-dark-primary dark:hover:bg-dark-secondary"
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
            <p className="mb-6 text-light-text dark:text-dark-text">
              Are you sure you want to delete this contract? This action cannot
              be undone.
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
