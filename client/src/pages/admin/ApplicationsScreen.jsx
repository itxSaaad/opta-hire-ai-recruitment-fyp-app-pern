import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaPencilAlt, FaSave, FaTimes, FaTrash } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

import ErrorMsg from '../../components/ErrorMsg';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import Table from '../../components/ui/dashboardLayout/Table';
import InputField from '../../components/ui/mainLayout/InputField';

import { trackEvent, trackPageView } from '../../utils/analytics';

import {
  useGetAllApplicationsQuery,
  useUpdateApplicationMutation,
  useDeleteApplicationMutation,
} from '../../features/application/applicationApi';

export default function ApplicationsScreen() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // We are updating only the application's status per your controller update logic.
  const [status, setStatus] = useState('');

  const routeLocation = useLocation();

  const {
    data: applications,
    isLoading,
    error,
    refetch,
  } = useGetAllApplicationsQuery();
  const [updateApplication, { isLoading: isUpdating, error: updateError }] =
    useUpdateApplicationMutation();
  const [deleteApplication, { isLoading: isDeleting, error: deleteError }] =
    useDeleteApplicationMutation();

  useEffect(() => {
    trackPageView(routeLocation.pathname);
  }, [routeLocation.pathname]);

  useEffect(() => {
    if (selectedApplication) {
      // Pre-fill the status when editing an application.
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

  // Define columns for the table. Data is retrieved from nested "candidate" and "job" objects.
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
          className={`text-xs font-medium px-2.5 py-0.5 rounded ${
            application.status === 'applied'
              ? 'bg-blue-100 text-blue-800'
              : application.status === 'shortlisted'
                ? 'bg-green-100 text-green-800'
                : application.status === 'accepted'
                  ? 'bg-teal-100 text-teal-800'
                  : application.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
          }`}
        >
          {application.status}
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

  // Define actions for each table row
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
        <title>Applications Management [Admin] - OptaHire</title>
        <meta
          name="description"
          content="OptaHire Admin Applications Management - Manage all candidate applications efficiently."
        />
        <meta
          name="keywords"
          content="OptaHire, Admin Applications, Recruitment, Applications"
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
              Applications Management
            </h1>

            {error && <ErrorMsg errorMsg={error.data.message} />}

            <Table
              columns={columns}
              data={applications?.applications || []}
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
            {updateError && <ErrorMsg errorMsg={updateError.data.message} />}
            <InputField
              id="status"
              type="select"
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'applied', label: 'Applied' },
                { value: 'shortlisted', label: 'Shortlisted' },
                { value: 'accepted', label: 'Accepted' },
                { value: 'rejected', label: 'Rejected' },
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
            {deleteError && <ErrorMsg errorMsg={deleteError.data.message} />}
            <p className="mb-6 text-light-text dark:text-dark-text">
              Are you sure you want to delete this application? This action
              cannot be undone.
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
