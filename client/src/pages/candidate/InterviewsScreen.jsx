import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaBriefcase,
  FaCalendar,
  FaEye,
  FaInfo,
  FaTimes,
  FaUser,
  FaVideo,
} from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import Table from '../../components/ui/dashboardLayout/Table';

import { trackEvent, trackPageView } from '../../utils/analytics';

import {
  useGetAllInterviewsQuery,
  useGetInterviewByIdQuery,
} from '../../features/interview/interviewApi';

export default function CandidateInterviewsScreen() {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const {
    data: interviewsData,
    isLoading: isInterviewsLoading,
    error: interviewsError,
  } = useGetAllInterviewsQuery({ role: 'candidate' });

  const {
    data: interviewDetails,
    isLoading: isInterviewLoading,
    error: interviewError,
  } = useGetInterviewByIdQuery(selectedInterview?.id, {
    skip: !selectedInterview,
  });

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  const handleViewDetails = (interview) => {
    setSelectedInterview(interview);
    setShowDetailsModal(true);
    trackEvent(
      'View Interview Details',
      'User Action',
      'User viewed interview details'
    );
  };

  const handleJoinInterview = (interview) => {
    navigate(`/interview/${interview.roomId}`);
    trackEvent('Join Interview', 'User Action', 'User joined interview');
  };

  const columns = [
    {
      key: 'jobTitle',
      label: 'Job Title',
      render: (interview) => (
        <span className="font-medium text-light-text dark:text-dark-text">
          {interview.job.title}
        </span>
      ),
    },
    {
      key: 'interviewer',
      label: 'Interviewer',
      render: (interview) => (
        <span className="text-light-text/70 dark:text-dark-text/70">
          {interview.interviewer.firstName} {interview.interviewer.lastName}
        </span>
      ),
    },
    {
      key: 'scheduledTime',
      label: 'Scheduled On',
      render: (interview) => (
        <span className="text-light-text/70 dark:text-dark-text/70">
          {new Date(interview.scheduledTime).toLocaleString()}
        </span>
      ),
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
  ];

  const actions = [
    {
      onClick: handleJoinInterview,
      render: (interview) => {
        const now = new Date();
        const scheduledTime = new Date(interview.scheduledTime);
        const minutesUntilInterview = (scheduledTime - now) / (1000 * 60);

        const isJoinable =
          interview.status === 'ongoing' ||
          (interview.status === 'scheduled' &&
            minutesUntilInterview <= 5 &&
            minutesUntilInterview > -120);

        let buttonText = 'Join Interview';
        if (!isJoinable) {
          if (
            interview.status === 'completed' ||
            interview.status === 'cancelled'
          ) {
            buttonText = 'Interview Unavailable';
          } else if (
            interview.status === 'scheduled' &&
            minutesUntilInterview > 5
          ) {
            buttonText = 'Not Yet Available';
          } else {
            buttonText = 'Cannot Join';
          }
        }

        return (
          <button
            disabled={!isJoinable}
            className={`flex items-center gap-1 rounded px-3 py-1 ${
              isJoinable
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'cursor-not-allowed bg-gray-300 text-gray-600'
            }`}
          >
            <FaVideo />
            {buttonText}
          </button>
        );
      },
    },
    {
      onClick: handleViewDetails,
      render: () => (
        <button className="flex items-center gap-1 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600">
          <FaEye />
          View Details
        </button>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>
          My Interviews - OptaHire | Interview Schedule & Preparation
        </title>
        <meta
          name="description"
          content="Manage your interview schedule on OptaHire. View upcoming interviews, join video calls, and track interview feedback."
        />
        <meta
          name="keywords"
          content="OptaHire My Interviews, Interview Schedule, Video Interviews, Interview Preparation, Interview Feedback"
        />
      </Helmet>

      <section className="flex min-h-screen animate-fadeIn flex-col items-center bg-light-background px-4 py-24 dark:bg-dark-background">
        {isInterviewsLoading ? (
          <div className="relative w-full max-w-sm animate-fadeIn sm:max-w-md">
            <Loader />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-7xl animate-slideUp">
            <h1 className="mb-6 text-center text-3xl font-bold text-light-text dark:text-dark-text sm:text-4xl md:text-5xl">
              My{' '}
              <span className="text-light-primary dark:text-dark-primary">
                Interviews
              </span>
            </h1>
            <p className="mb-8 text-center text-lg text-light-text/70 dark:text-dark-text/70">
              Manage your interview schedule, join video interviews, and track
              your performance feedback.
            </p>

            {interviewsError && (
              <Alert message={interviewsError.data.message} />
            )}

            <Table
              columns={columns}
              data={interviewsData?.interviews || []}
              actions={actions}
            />
          </div>
        )}
      </section>

      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Interview Details"
      >
        {isInterviewLoading ? (
          <div className="mx-auto w-full max-w-sm sm:max-w-md">
            <Loader />
          </div>
        ) : (
          <>
            {selectedInterview && (
              <div className="rounded-lg bg-light-surface p-6 dark:bg-dark-surface">
                {interviewError && (
                  <Alert message={interviewError.data.message} />
                )}

                <div className="space-y-6">
                  <div className="border-b border-light-border pb-4 dark:border-dark-border">
                    <div className="flex items-center">
                      <FaBriefcase
                        className="mr-4 mt-1 text-light-primary dark:text-dark-primary"
                        size={20}
                      />
                      <div className="flex flex-col items-start">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Job Title
                        </p>
                        <p className="text-lg font-medium text-light-text dark:text-dark-text">
                          {interviewDetails?.interview?.job?.title}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-light-border pb-4 dark:border-dark-border">
                    <div className="flex items-center">
                      <FaVideo
                        className="mr-4 mt-1 text-light-primary dark:text-dark-primary"
                        size={20}
                      />
                      <div className="flex flex-col items-start">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Room ID
                        </p>
                        <p className="text-lg font-medium text-light-text dark:text-dark-text">
                          {interviewDetails?.interview?.roomId}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-light-border pb-4 dark:border-dark-border">
                    <div className="flex items-center">
                      <FaUser
                        className="mr-4 mt-1 text-light-primary dark:text-dark-primary"
                        size={20}
                      />
                      <div className="flex flex-col items-start">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Interviewer
                        </p>
                        <p className="text-lg font-medium text-light-text dark:text-dark-text">
                          {interviewDetails?.interview?.interviewer?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-light-border pb-4 dark:border-dark-border">
                    <div className="flex items-center">
                      <FaCalendar
                        className="mr-4 mt-1 text-light-primary dark:text-dark-primary"
                        size={20}
                      />
                      <div className="flex flex-col items-start">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Schedule
                        </p>
                        <p className="text-lg font-medium text-light-text dark:text-dark-text">
                          {new Date(
                            interviewDetails?.interview?.scheduledTime
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pb-2">
                    <div className="flex items-center">
                      <FaInfo
                        className="mr-4 mt-1 text-light-primary dark:text-dark-primary"
                        size={20}
                      />
                      <div className="flex flex-col items-start">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Status
                        </p>
                        <p className="text-lg font-medium capitalize text-light-text dark:text-dark-text">
                          {interviewDetails?.interview?.status}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    className="flex items-center gap-2 rounded bg-gray-300 px-4 py-2 text-gray-800 transition-all duration-200 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    <FaTimes />
                    Close
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Modal>
    </>
  );
}
