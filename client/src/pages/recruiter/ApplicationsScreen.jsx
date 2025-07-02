import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaPencilAlt, FaSave, FaTimes } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import Table from '../../components/ui/dashboardLayout/Table';
import InputField from '../../components/ui/mainLayout/InputField';

import { trackEvent, trackPageView } from '../../utils/analytics';

import {
  useGetAllApplicationsQuery,
  useUpdateApplicationMutation,
} from '../../features/application/applicationApi';

export default function CandidateApplicationsScreen() {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [status, setStatus] = useState('');

  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);

  const {
    data: applications,
    isLoading: isApplicationsLoading,
    error,
    refetch,
  } = useGetAllApplicationsQuery({
    role: 'recruiter',
    recruiterId: userInfo.id,
  });

  const [
    updateApplication,
    {
      isLoading: isUpdating,
      error: updateError,
      data: updatedApplication,
      isSuccess,
    },
  ] = useUpdateApplicationMutation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (selectedApplication) {
      setStatus(selectedApplication.status);
      setShowUpdateModal(true);
    }
  }, [selectedApplication]);

  const handleUpdateStatus = (application) => {
    setSelectedApplication(application);
    trackEvent(
      'Open Update Status Modal',
      'User Action',
      `User opened update status modal for application ID: ${application.id}`
    );
  };

  const updateApplicationStatus = async () => {
    try {
      await updateApplication({
        id: selectedApplication.id,
        applicationData: { status },
      }).unwrap();

      setShowUpdateModal(false);
      setSelectedApplication(null);
      refetch();
      trackEvent(
        'Update Application Status',
        'User Action',
        `User updated application status to ${status}`
      );
    } catch (err) {
      console.error('Update failed:', err);
      trackEvent(
        'Update Application Status Failed',
        'User Action',
        `User failed to update application status`
      );
    }
  };

  const columns = [
    {
      key: 'jobTitle',
      label: 'Job Title',
      render: (application) => (
        <span className="font-medium text-light-text dark:text-dark-text">
          {application.job.title}
        </span>
      ),
    },
    {
      key: 'companyName',
      label: 'Company Name',
      render: (application) => (
        <span className="text-light-text/70 dark:text-dark-text/70">
          {application.job.company}
        </span>
      ),
    },
    {
      key: 'candidateName',
      label: 'Candidate',
      render: (application) => (
        <span className="text-light-text dark:text-dark-text">
          {application.candidate?.firstName && application.candidate?.lastName
            ? `${application.candidate.firstName} ${application.candidate.lastName}`
            : 'Unknown Candidate'}
        </span>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (application) => application.job.category,
    },
    {
      key: 'status',
      label: 'Status',
      render: (application) => (
        <span
          className={`rounded px-2.5 py-0.5 text-xs font-medium ${
            application.status === 'applied'
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
      render: (application) => (
        <span className="text-light-text/70 dark:text-dark-text/70">
          {new Date(application.applicationDate).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const actions = [
    {
      onClick: handleUpdateStatus,
      render: () => (
        <button className="flex items-center gap-1 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600">
          <FaPencilAlt />
          Update Status
        </button>
      ),
    },
  ];

  const isLoading = isApplicationsLoading || isUpdating;

  return (
    <>
      <Helmet>
        <title>
          Review Applications - OptaHire | AI-Powered Candidate Screening
        </title>
        <meta
          name="description"
          content="Review candidate applications with AI-powered screening on OptaHire. Access top-quality matches for your job openings."
        />
        <meta
          name="keywords"
          content="OptaHire Review Applications, AI Candidate Screening, Top Candidates, Application Review, Smart Hiring"
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
              Review{' '}
              <span className="text-light-primary dark:text-dark-primary">
                Applications
              </span>
            </h1>
            <p className="mb-8 text-center text-lg text-light-text/70 dark:text-dark-text/70">
              Review AI-screened candidate applications and discover the perfect
              matches for your job openings.
            </p>

            {error && <Alert message={error.data?.message} />}
            {updateError && <Alert message={updateError.data?.message} />}
            {isSuccess && (
              <Alert
                message={updatedApplication?.message}
                isSuccess={isSuccess}
              />
            )}

            <Table
              columns={columns}
              actions={actions}
              data={applications?.applications || []}
            />
          </div>
        )}
      </section>

      <Modal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedApplication(null);
        }}
        title="Update Application Status"
      >
        {isUpdating ? (
          <Loader />
        ) : (
          <div className="space-y-4">
            {updateError && <Alert message={updateError.data?.message} />}
            {isSuccess && (
              <Alert
                type="success"
                message="Application status updated successfully!"
              />
            )}

            {selectedApplication && (
              <div className="mb-4 rounded bg-gray-50 p-4 dark:bg-gray-800">
                <p className="font-medium text-light-text dark:text-dark-text">
                  <span className="text-light-primary dark:text-dark-primary">
                    Job:
                  </span>{' '}
                  {selectedApplication.job?.title}
                </p>
                <p className="text-light-text/70 dark:text-dark-text/70">
                  <span className="font-medium">Candidate:</span>{' '}
                  {selectedApplication.candidate?.firstName &&
                  selectedApplication.candidate?.lastName
                    ? `${selectedApplication.candidate.firstName} ${selectedApplication.candidate.lastName}`
                    : 'Unknown Candidate'}
                </p>
              </div>
            )}

            <InputField
              id="status"
              type="select"
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'applied', label: 'Applied' },
                { value: 'shortlisted', label: 'Shortlisted' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'hired', label: 'Hired' },
              ]}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <button
                className="flex items-center gap-2 rounded bg-gray-300 px-4 py-2 text-gray-800 transition-all duration-200 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedApplication(null);
                }}
                disabled={isUpdating}
              >
                <FaTimes />
                Cancel
              </button>
              <button
                className="flex items-center gap-2 rounded bg-light-primary px-4 py-2 text-white transition-all duration-200 hover:bg-light-secondary dark:bg-dark-primary dark:hover:bg-dark-secondary"
                onClick={updateApplicationStatus}
                disabled={isUpdating}
              >
                <FaSave />
                Update Status
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
