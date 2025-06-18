import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaCalendarAlt, FaSave, FaTimes } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import Table from '../../components/ui/dashboardLayout/Table';
import InputField from '../../components/ui/mainLayout/InputField';

import { trackEvent, trackPageView } from '../../utils/analytics';

import { useGetAllApplicationsQuery } from '../../features/application/applicationApi';
import { useCreateInterviewMutation } from '../../features/interview/interviewApi';

export default function ApplicationsScreen() {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');

  const routeLocation = useLocation();
  const interviewerId = useSelector((state) => state.auth.userInfo.id);

  const {
    data: applicationsData,
    isLoading,
    error,
    refetch,
  } = useGetAllApplicationsQuery({
    role: 'interviewer',
    interviewerId,
    status: 'shortlisted',
  });

  const [
    createInterview,
    { isLoading: isCreating, error: createError, data: createData },
  ] = useCreateInterviewMutation();

  useEffect(() => {
    trackPageView(routeLocation.pathname);
  }, [routeLocation.pathname]);

  useEffect(() => {
    if (selectedApplication) {
      // Reset form fields when a new application is selected
      setInterviewDate('');
      setInterviewTime('');
    }
  }, [selectedApplication]);

  const handleSchedule = (application) => {
    setSelectedApplication(application);
    setShowScheduleModal(true);
    trackEvent(
      'Schedule Interview',
      'User Action',
      'Interviewer clicked on schedule interview button'
    );
  };

  const scheduleInterview = async () => {
    try {
      const interviewDateTime = `${interviewDate}T${interviewTime}`;

      await createInterview({
        scheduledTime: interviewDateTime,
        candidateId: selectedApplication.candidate.id,
        jobId: selectedApplication.job.id,
        applicationId: selectedApplication.id,
      }).unwrap();

      setShowScheduleModal(false);
      refetch();
      trackEvent(
        'Interview Scheduled',
        'User Action',
        `Interviewer scheduled interview for application ${selectedApplication.id}`
      );
    } catch (err) {
      console.error('Scheduling failed:', err);
      trackEvent(
        'Schedule Interview Failed',
        'User Action',
        `Failed to schedule interview for application ${selectedApplication.id}`
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
            : application.candidate?.email || 'N/A'}
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
      onClick: handleSchedule,
      render: () => (
        <button className="flex items-center gap-1 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600">
          <FaCalendarAlt className="text-lg" />
          Schedule Interview
        </button>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>
          Review Applications - OptaHire | AI-Shortlisted Candidates
        </title>
        <meta
          name="description"
          content="Review AI-shortlisted candidate applications on OptaHire. Access top-quality candidates for efficient interview processes."
        />
        <meta
          name="keywords"
          content="OptaHire Review Applications, AI Shortlisted Candidates, Interview Candidates, Candidate Review, Quality Candidates"
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
              Review AI-shortlisted candidate applications and prepare for
              high-quality interview sessions.
            </p>

            {(error || createError) && (
              <Alert
                message={error?.data?.message || createError?.data?.message}
              />
            )}

            {createData?.message && createData?.success && (
              <Alert
                message={createData?.message}
                isSuccess={createData?.success}
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

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Interview"
      >
        {isCreating ? (
          <Loader />
        ) : (
          <div className="space-y-4">
            <InputField
              id="interviewDate"
              type="date"
              label="Interview Date"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            <InputField
              id="interviewTime"
              type="time"
              label="Interview Time"
              value={interviewTime}
              onChange={(e) => setInterviewTime(e.target.value)}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <button
                className="flex items-center gap-2 rounded bg-gray-300 px-4 py-2 text-gray-800 transition-all duration-200 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                onClick={() => setShowScheduleModal(false)}
                disabled={isCreating}
              >
                <FaTimes />
                Cancel
              </button>
              <button
                className="flex items-center gap-2 rounded bg-light-primary px-4 py-2 text-white transition-all duration-200 hover:bg-light-secondary dark:bg-dark-primary dark:hover:bg-dark-secondary"
                onClick={scheduleInterview}
                disabled={isCreating || !interviewDate || !interviewTime}
              >
                <FaSave />
                Schedule Interview
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
