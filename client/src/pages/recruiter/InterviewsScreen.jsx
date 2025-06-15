import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaBriefcase,
  FaCalendarAlt,
  FaClipboard,
  FaClock,
  FaCommentDots,
  FaEnvelope,
  FaFileAlt,
  FaInfoCircle,
  FaStar,
  FaTimes,
  FaUser,
} from 'react-icons/fa';
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
          className={`rounded px-2.5 py-0.5 text-xs font-medium ${
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
          className={`rounded px-2.5 py-0.5 text-xs font-medium ${
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
        <button className="flex items-center gap-1 rounded bg-indigo-500 px-3 py-1 text-white hover:bg-indigo-600">
          <FaCalendarAlt />
          View Details
        </button>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>
          Interview Management - OptaHire | Track Interview Progress
        </title>
        <meta
          name="description"
          content="Manage interview progress on OptaHire. Track candidate interviews, review feedback, and make informed hiring decisions."
        />
        <meta
          name="keywords"
          content="OptaHire Interview Management, Interview Tracking, Candidate Progress, Interview Feedback, Hiring Decisions"
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
              Interview{' '}
              <span className="text-light-primary dark:text-dark-primary">
                Management
              </span>
            </h1>
            <p className="mb-8 text-center text-lg text-light-text/70 dark:text-dark-text/70">
              Track interview progress, review candidate feedback, and make
              data-driven hiring decisions.
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
          <div className="space-y-4 text-left">
            <div className="break-words border-b border-light-border pb-4 dark:border-dark-border">
              <div className="flex items-start">
                <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                  <FaBriefcase
                    className="text-light-primary dark:text-dark-primary"
                    size={20}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Job Title
                  </p>
                  <p className="text-lg font-medium text-light-text dark:text-dark-text">
                    {selectedInterview.job.title || 'Not set'}
                  </p>
                </div>
              </div>
            </div>

            <div className="break-words border-b border-light-border pb-4 dark:border-dark-border">
              <div className="flex items-start">
                <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                  <FaFileAlt
                    className="text-light-primary dark:text-dark-primary"
                    size={20}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Job Description
                  </p>
                  <p className="whitespace-pre-wrap text-lg font-medium text-light-text dark:text-dark-text">
                    {selectedInterview.job.description || 'Not set'}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-light-border pb-4 dark:border-dark-border">
              <div className="flex items-start">
                <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                  <FaUser
                    className="text-light-primary dark:text-dark-primary"
                    size={20}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Candidate Name
                  </p>
                  <p className="break-words text-lg font-medium text-light-text dark:text-dark-text">
                    {selectedInterview.candidate.firstName}{' '}
                    {selectedInterview.candidate.lastName}
                  </p>
                </div>
              </div>
            </div>

            <div className="break-words border-b border-light-border pb-4 dark:border-dark-border">
              <div className="flex items-start">
                <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                  <FaEnvelope
                    className="text-light-primary dark:text-dark-primary"
                    size={20}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Email
                  </p>
                  <p className="text-lg font-medium text-light-text dark:text-dark-text">
                    {selectedInterview.candidate.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-light-border pb-4 dark:border-dark-border">
              <div className="flex items-start">
                <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                  <FaClock
                    className="text-light-primary dark:text-dark-primary"
                    size={20}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Scheduled Time
                  </p>
                  <p className="text-lg font-medium text-light-text dark:text-dark-text">
                    {new Date(selectedInterview.scheduledTime).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-light-border pb-4 dark:border-dark-border">
              <div className="flex items-start">
                <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                  <FaInfoCircle
                    className="text-light-primary dark:text-dark-primary"
                    size={20}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Status
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                      selectedInterview.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-800'
                        : selectedInterview.status === 'ongoing'
                          ? 'bg-green-100 text-green-800'
                          : selectedInterview.status === 'completed'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {selectedInterview.status.charAt(0).toUpperCase() +
                      selectedInterview.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-b border-light-border pb-4 dark:border-dark-border">
              <div className="flex items-start">
                <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                  <FaStar
                    className="text-light-primary dark:text-dark-primary"
                    size={20}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Rating
                  </p>
                  <p className="text-lg font-medium text-light-text dark:text-dark-text">
                    {selectedInterview.rating ? (
                      <span className="text-yellow-600 dark:text-yellow-400">
                        {selectedInterview.rating}/5
                      </span>
                    ) : (
                      'Not Rated'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {selectedInterview.summary && (
              <div className="border-b border-light-border pb-4 dark:border-dark-border">
                <div className="flex items-start">
                  <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                    <FaClipboard
                      className="text-light-primary dark:text-dark-primary"
                      size={20}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Summary
                    </p>
                    <p className="whitespace-pre-wrap break-words text-lg font-medium text-light-text dark:text-dark-text">
                      {selectedInterview.summary}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedInterview.remarks && (
              <div className="border-b border-light-border pb-4 dark:border-dark-border">
                <div className="flex items-start">
                  <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                    <FaCommentDots
                      className="text-light-primary dark:text-dark-primary"
                      size={20}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Remarks
                    </p>
                    <p className="whitespace-pre-wrap break-words text-lg font-medium text-light-text dark:text-dark-text">
                      {selectedInterview.remarks}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                className="flex items-center gap-2 rounded bg-gray-200 px-4 py-2 text-gray-800 transition-all duration-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
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
