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
import { useLocation } from 'react-router-dom';

import ErrorMsg from '../../components/ErrorMsg';
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
    window.location.href = `/interview/${interview.roomId}`;
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
  ];

  const actions = [
    {
      onClick: handleJoinInterview,
      render: (interview) => {
        const now = new Date();
        const scheduledTime = new Date(interview.scheduledTime);
        const timeDiff = Math.abs(now - scheduledTime) / (1000 * 60);
        const isJoinable = interview.status === 'scheduled' && timeDiff <= 15;

        return (
          <button
            disabled={!isJoinable}
            className={`px-3 py-1 rounded flex items-center gap-1 ${
              isJoinable
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
          >
            <FaVideo />
            {isJoinable ? 'Join Interview' : 'Cannot Join Yet'}
          </button>
        );
      },
    },
    {
      onClick: handleViewDetails,
      render: () => (
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1">
          <FaEye />
          View Details
        </button>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>Track Your Interviews [Candidate] - OptaHire</title>
        <meta
          name="description"
          content="Track your interviews with OptaHire. Stay updated on your interview schedules and statuses."
        />
        <meta
          name="keywords"
          content="interviews, track interviews, interview schedules, interview statuses, OptaHire"
        />
      </Helmet>

      <section className="min-h-screen flex flex-col items-center py-24 px-4 bg-light-background dark:bg-dark-background animate-fadeIn">
        {isInterviewsLoading ? (
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
              Stay updated on your interview schedules and statuses
            </p>

            {interviewsError && (
              <ErrorMsg errorMsg={interviewsError.data.message} />
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
          <div className="w-full max-w-sm sm:max-w-md mx-auto">
            <Loader />
          </div>
        ) : (
          <>
            {selectedInterview && (
              <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-6">
                {interviewError && (
                  <ErrorMsg errorMsg={interviewError.data.message} />
                )}

                <div className="space-y-6">
                  <div className="border-b border-light-border dark:border-dark-border pb-4">
                    <div className="flex items-center">
                      <FaBriefcase
                        className="text-light-primary dark:text-dark-primary mt-1 mr-4"
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

                  <div className="border-b border-light-border dark:border-dark-border pb-4">
                    <div className="flex items-center">
                      <FaVideo
                        className="text-light-primary dark:text-dark-primary mt-1 mr-4"
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

                  <div className="border-b border-light-border dark:border-dark-border pb-4">
                    <div className="flex items-center">
                      <FaUser
                        className="text-light-primary dark:text-dark-primary mt-1 mr-4"
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

                  <div className="border-b border-light-border dark:border-dark-border pb-4">
                    <div className="flex items-center">
                      <FaCalendar
                        className="text-light-primary dark:text-dark-primary mt-1 mr-4"
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
                        className="text-light-primary dark:text-dark-primary mt-1 mr-4"
                        size={20}
                      />
                      <div className="flex flex-col items-start">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Status
                        </p>
                        <p className="text-lg font-medium text-light-text dark:text-dark-text capitalize">
                          {interviewDetails?.interview?.status}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-all duration-200"
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
