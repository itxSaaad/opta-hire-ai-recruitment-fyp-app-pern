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
  useDeleteApplicationMutation,
  useGetAllApplicationsQuery,
  useUpdateApplicationMutation,
} from '../../features/application/applicationApi';

export default function ApplicationsScreen() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const [status, setStatus] = useState('');

  const routeLocation = useLocation();

  const {
    data: applicationsData,
    isLoading,
    error,
    refetch,
  } = useGetAllApplicationsQuery();
  const [
    updateApplication,
    { isLoading: isUpdating, error: updateError, data: updateData },
  ] = useUpdateApplicationMutation();
  const [
    deleteApplication,
    { isLoading: isDeleting, error: deleteError, data: deleteData },
  ] = useDeleteApplicationMutation();

  useEffect(() => {
    trackPageView(routeLocation.pathname);
  }, [routeLocation.pathname]);

  useEffect(() => {
    if (selectedApplication) {
      setStatus(selectedApplication.status || '');
    }
  }, [selectedApplication]);

  const handleEdit = (application) => {
    setSelectedApplication(application);
    setShowEditModal(true);
    trackEvent(
      'Edit Application',
      'User Action',
      'User clicked on edit application button'
    );
  };

  const handleDelete = (application) => {
    setSelectedApplication(application);
    setShowDeleteModal(true);
    trackEvent(
      'Delete Application',
      'User Action',
      'User clicked on delete application button'
    );
  };

  const confirmDelete = async () => {
    try {
      await deleteApplication(selectedApplication.id).unwrap();
      setShowDeleteModal(false);
      refetch();
      trackEvent(
        'Delete Application Confirmed',
        'User Action',
        `User confirmed deletion of application ${selectedApplication.id}`
      );
    } catch (err) {
      console.error('Deletion failed:', err);
      trackEvent(
        'Delete Application Failed',
        'User Action',
        `User failed to delete application ${selectedApplication.id}`
      );
    }
  };

  const saveApplicationChanges = async () => {
    try {
      await updateApplication({
        id: selectedApplication.id,
        applicationData: { status },
      }).unwrap();
      setShowEditModal(false);
      refetch();
      trackEvent(
        'Update Application',
        'User Action',
        `User updated application ${selectedApplication.id}`
      );
    } catch (err) {
      console.error('Update failed:', err);
      trackEvent(
        'Update Application Failed',
        'User Action',
        `User failed to update application ${selectedApplication.id}`
      );
    }
  };

  const columns = [
    {
      key: 'candidateName',
      label: 'Candidate',
      render: (application) =>
        `${application.candidate.firstName} ${application.candidate.lastName}`,
    },
    {
      key: 'email',
      label: 'Email',
      render: (application) => application.candidate.email,
    },
    {
      key: 'jobTitle',
      label: 'Job Title',
      render: (application) => application.job.title,
    },
    {
      key: 'location',
      label: 'Location',
      render: (application) => application.job.location,
    },
    {
      key: 'status',
      label: 'Status',
      render: (application) => (
        <span
          className={`rounded px-2.5 py-0.5 text-xs font-medium ${
            application.status === 'pending'
              ? 'bg-gray-100 text-gray-800'
              : application.status === 'applied'
                ? 'bg-blue-100 text-blue-800'
                : application.status === 'shortlisted'
                  ? 'bg-green-100 text-green-800'
                  : application.status === 'hired'
                    ? 'bg-teal-100 text-teal-800'
                    : application.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
          }`}
        >
          {application.status.charAt(0).toUpperCase() +
            application.status.slice(1).toLowerCase()}
        </span>
      ),
    },
    {
      key: 'applicationDate',
      label: 'Applied On',
      render: (application) =>
        new Date(application.applicationDate).toLocaleDateString(),
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
          Applications Management [Admin] - OptaHire | Monitor All Applications
        </title>
        <meta
          name="description"
          content="OptaHire Admin Applications Management - Track and monitor all candidate applications across the platform efficiently."
        />
        <meta
          name="keywords"
          content="OptaHire Admin Applications, Application Management, Recruitment Tracking, Candidate Applications"
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
                Applications
              </span>
            </h1>
            <p className="mb-8 text-center text-lg text-light-text/70 dark:text-dark-text/70">
              View and manage all candidate applications across the platform
              with comprehensive tracking and analytics.
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
              data={applicationsData?.applications || []}
              actions={actions}
            />
          </div>
        )}
      </section>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Application"
      >
        {isUpdating ? (
          <Loader />
        ) : (
          <div className="space-y-4">
            <InputField
              id="status"
              type="select"
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'applied', label: 'Applied' },
                { value: 'shortlisted', label: 'Shortlisted' },
                { value: 'hired', label: 'Hired' },
                { value: 'rejected', label: 'Rejected' },
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
                onClick={saveApplicationChanges}
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
        title="Confirm Application Deletion"
      >
        {isDeleting ? (
          <Loader />
        ) : (
          <div>
            <p className="mb-6 text-light-text dark:text-dark-text">
              Are you sure you want to delete this application? This action
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
