import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaBriefcase,
  FaClipboardList,
  FaCommentDots,
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

import { useGetAllRatingsQuery } from '../../features/interviewerRating/interviewerRatingApi';

export default function RatingsScreen() {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);

  const location = useLocation();

  const {
    data: ratingsData,
    isLoading,
    error,
  } = useGetAllRatingsQuery({
    interviewerId: useSelector((state) => state.auth.userInfo.id),
  });

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  const handleDetails = (rating) => {
    setSelectedRating(rating);
    setShowDetailsModal(true);
    trackEvent(
      'View Rating Details',
      'User Action',
      'User viewed rating details'
    );
  };

  const columns = [
    {
      key: 'recruiter',
      label: 'Recruiter',
      render: (rating) => (
        <span className="text-light-text/70 dark:text-dark-text/70">
          {`${rating.recruiter.firstName} ${rating.recruiter.lastName}`}
        </span>
      ),
    },
    {
      key: 'job',
      label: 'Job',
      render: (rating) => (
        <span className="text-light-text/70 dark:text-dark-text/70">
          {rating.job.title}
        </span>
      ),
    },
    {
      key: 'company',
      label: 'Company',
      render: (rating) => rating.job.company,
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (rating) => (
        <span
          className={`rounded px-2.5 py-0.5 text-xs font-medium ${
            rating.rating
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {rating.rating ? `${rating.rating}/5` : 'Not Rated'}
        </span>
      ),
    },
    {
      key: 'feedback',
      label: 'Feedback',
      render: (rating) => (
        <div className="max-w-xs truncate">{rating.feedback}</div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (rating) => (
        <span className="text-light-text/70 dark:text-dark-text/70">
          {new Date(rating.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const actions = [
    {
      onClick: handleDetails,
      render: () => (
        <button className="flex items-center gap-1 rounded bg-indigo-500 px-3 py-1 text-white hover:bg-indigo-600">
          <FaStar />
          View Details
        </button>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>My Ratings - OptaHire | Interview Performance Reviews</title>
        <meta
          name="description"
          content="View your interview ratings and feedback on OptaHire. Track your performance and build a stellar reputation as an interviewer."
        />
        <meta
          name="keywords"
          content="OptaHire Interviewer Ratings, Interview Performance, Feedback Reviews, Professional Reputation, Interview Quality"
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
              My{' '}
              <span className="text-light-primary dark:text-dark-primary">
                Ratings
              </span>
            </h1>
            <p className="mb-8 text-center text-lg text-light-text/70 dark:text-dark-text/70">
              Track your interview performance ratings and build your reputation
              as a professional interviewer.
            </p>

            {error && <Alert message={error?.data?.message} />}

            <Table
              columns={columns}
              data={ratingsData?.interviewerRatings || []}
              actions={actions}
            />
          </div>
        )}
      </section>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Rating Details"
      >
        {selectedRating && (
          <div className="space-y-4 text-left">
            <div className="border-b border-light-border pb-4 dark:border-dark-border">
              <div className="flex items-start">
                <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                  <FaUser
                    className="text-light-primary dark:text-dark-primary"
                    size={20}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Interviewer
                  </p>
                  <p className="break-words text-lg font-medium text-light-text dark:text-dark-text">
                    {selectedRating.interviewer.firstName}{' '}
                    {selectedRating.interviewer.lastName}
                  </p>
                  <p className="mt-1 text-sm text-light-secondary dark:text-dark-secondary">
                    {selectedRating.interviewer.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="break-words border-b border-light-border pb-4 dark:border-dark-border">
              <div className="flex items-start">
                <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                  <FaBriefcase
                    className="text-light-primary dark:text-dark-primary"
                    size={20}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Job
                  </p>
                  <p className="text-lg font-medium text-light-text dark:text-dark-text">
                    {selectedRating.job.title}
                  </p>
                  <p className="mt-1 text-sm text-light-secondary dark:text-dark-secondary">
                    {selectedRating.job.company}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-light-border pb-4 dark:border-dark-border">
              <div className="flex items-start">
                <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                  <FaClipboardList
                    className="text-light-primary dark:text-dark-primary"
                    size={20}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Contract ID
                  </p>
                  <p className="break-words text-lg font-medium text-light-text dark:text-dark-text">
                    {selectedRating.contractId}
                  </p>
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
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Rating
                  </p>
                  <span className="mt-1 inline-block text-lg font-medium text-light-text dark:text-dark-text">
                    {selectedRating.rating}/5
                  </span>
                </div>
              </div>
            </div>

            <div className="border-b border-light-border pb-4 dark:border-dark-border">
              <div className="flex items-start">
                <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                  <FaCommentDots
                    className="text-light-primary dark:text-dark-primary"
                    size={20}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Feedback
                  </p>
                  <p className="mt-1 whitespace-pre-wrap break-words text-lg font-medium text-light-text dark:text-dark-text">
                    {selectedRating.feedback || 'No feedback provided.'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                className="flex items-center gap-2 rounded bg-gray-200 px-4 py-2 text-gray-800 transition-all duration-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={() => setShowDetailsModal(false)}
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
