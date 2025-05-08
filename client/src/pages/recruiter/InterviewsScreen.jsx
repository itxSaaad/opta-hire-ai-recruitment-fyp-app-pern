import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaCalendarAlt, FaTimes } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import Table from '../../components/ui/dashboardLayout/Table';

import { trackEvent, trackPageView } from '../../utils/analytics';

import { useGetAllInterviewsQuery } from '../../features/interview/interviewApi';

export default function InterviewsScreen() {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);

  const routeLocation = useLocation();
  const { userInfo } = useSelector((state) => state.auth);

  const {
    data: interviewsData,
    isLoading,
    error,
  } = useGetAllInterviewsQuery({
    recruiterId: userInfo.id,
  });

  useEffect(() => {
    trackPageView(routeLocation.pathname);
  }, [routeLocation.pathname]);

  const handleDetails = (interview) => {
    setSelectedInterview(interview);
    setShowDetails(true);
    trackEvent(
      'View Interview Details',
      'User Action',
      `User clicked on interview ${interview.id} details button`
    );
  };

  const columns = [
    {
      key: 'jobTitle',
      label: 'Job Title',
      render: (interview) => interview.job.title,
    },
    {
      key: 'candidate',
      label: 'Candidate',
      render: (interview) =>
        `${interview.candidate.firstName} ${interview.candidate.lastName}`,
    },
    {
      key: 'interviewer',
      label: 'Interviewer',
      render: (interview) =>
        `${interview.interviewer.firstName} ${interview.interviewer.lastName}`,
    },
    {
      key: 'scheduledTime',
      label: 'Scheduled Time',
      render: (interview) => new Date(interview.scheduledTime).toLocaleString(),
    },
    {
      key: 'status',
      label: 'Status',
      render: (interview) => (
        <span
          className={`text-xs font-medium px-2.5 py-0.5 rounded ${
            interview.status === 'scheduled'
              ? 'bg-blue-100 text-blue-800'
              : interview.status === 'ongoing'
                ? 'bg-green-100 text-green-800'
                : interview.status === 'completed'
                  ? 'bg-teal-100 text-teal-800'
                  : interview.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
          }`}
        >
          {interview.status.charAt(0).toUpperCase() +
            interview.status.slice(1).toLowerCase()}
        </span>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (interview) => (
        <span
          className={`text-xs font-medium px-2.5 py-0.5 rounded ${
            interview.rating
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {interview.rating ? `${interview.rating}/5` : 'Not Rated'}
        </span>
      ),
    },
  ];

  const actions = [
    {
      onClick: handleDetails,
      render: () => (
        <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded flex items-center gap-1">
          <FaCalendarAlt />
          View Details
        </button>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>Track Interviews [Recruiter] - OptaHire</title>
        <meta
          name="description"
          content="OptaHire Recruiter Interviews - Track and manage your interviews efficiently."
        />
        <meta
          name="keywords"
          content="interviews, interview tracking, interview management, job interviews, candidate interviews, interview details, interview status, interview rating"
        />
      </Helmet>

      <section className="min-h-screen flex flex-col items-center py-24 px-4 bg-light-background dark:bg-dark-background animate-fadeIn">
        {isLoading ? (
          <div className="w-full max-w-sm sm:max-w-md relative animate-fadeIn">
            <Loader />
          </div>
        ) : (
          <div className="max-w-7xl w-full mx-auto animate-slideUp">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-light-text dark:text-dark-text mb-6">
              Track Your{' '}
              <span className="text-light-primary dark:text-dark-primary">
                Interviews
              </span>
            </h1>
            <p className="text-lg text-light-text/70 dark:text-dark-text/70 text-center mb-8">
              Manage and monitor your interviews efficiently. View, edit, and
              delete interviews as needed.
            </p>

            {error && <Alert message={error.data.message} />}

            <Table
              columns={columns}
              data={interviewsData?.interviews || []}
              actions={actions}
            />
          </div>
        )}
      </section>
      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title="Interview Details"
      >
        {selectedInterview && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Job Information</h3>
                <p>
                  <span className="font-medium">Title:</span>{' '}
                  {selectedInterview.job.title}
                </p>
                <p>
                  <span className="font-medium">Description:</span>{' '}
                  {selectedInterview.job.description}
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">
                  Candidate Information
                </h3>
                <p>
                  <span className="font-medium">Name:</span>{' '}
                  {selectedInterview.candidate.firstName}{' '}
                  {selectedInterview.candidate.lastName}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{' '}
                  {selectedInterview.candidate.email}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Interview Details</h3>
              <p>
                <span className="font-medium">Scheduled Time:</span>{' '}
                {new Date(selectedInterview.scheduledTime).toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Status:</span>
                <span
                  className={`ml-2 text-xs font-medium px-2.5 py-0.5 rounded ${
                    selectedInterview.status === 'scheduled'
                      ? 'bg-blue-100 text-blue-800'
                      : selectedInterview.status === 'ongoing'
                        ? 'bg-green-100 text-green-800'
                        : selectedInterview.status === 'completed'
                          ? 'bg-teal-100 text-teal-800'
                          : selectedInterview.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {selectedInterview.status.charAt(0).toUpperCase() +
                    selectedInterview.status.slice(1).toLowerCase()}
                </span>
              </p>
              <p>
                <span className="font-medium">Rating:</span>
                {selectedInterview.rating ? (
                  <span className="ml-2 text-xs font-medium px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
                    {selectedInterview.rating}/5
                  </span>
                ) : (
                  <span className="ml-2 text-xs font-medium px-2.5 py-0.5 rounded bg-gray-100 text-gray-800">
                    Not Rated
                  </span>
                )}
              </p>
            </div>

            {selectedInterview.summary && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Summary</h3>
                <p className="whitespace-pre-line">
                  {selectedInterview.summary}
                </p>
              </div>
            )}

            {selectedInterview.remarks && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Remarks</h3>
                <p className="whitespace-pre-line">
                  {selectedInterview.remarks}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-all duration-200"
                onClick={() => setShowDetails(false)}
              >
                <FaTimes />
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
