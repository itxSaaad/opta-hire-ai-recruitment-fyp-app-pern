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
import { useLocation } from 'react-router-dom';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import Table from '../../components/ui/dashboardLayout/Table';

import { trackPageView } from '../../utils/analytics';

import { useGetAllRatingsQuery } from '../../features/interviewerRating/interviewerRatingApi';

export default function RatingsScreen() {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);

  const location = useLocation();

  const { data: ratingsData, isLoading, error } = useGetAllRatingsQuery();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  const handleDetails = (rating) => {
    setSelectedRating(rating);
    setShowDetails(true);
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
          className={`text-xs font-medium px-2.5 py-0.5 rounded ${
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
        <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded flex items-center gap-1">
          <FaStar />
          View Details
        </button>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>View Ratings [Interviewer] - OptaHire</title>
        <meta
          name="description"
          content="OptaHire Interviewer Ratings - View all the ratings given to you by recruiters for the interviews you conducted."
        />
        <meta
          name="keywords"
          content="OptaHire, ratings, interviewer, recruiter feedback, interview ratings"
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
              View Your{' '}
              <span className="text-light-primary dark:text-dark-primary">
                Ratings
              </span>
            </h1>
            <p className="text-lg text-light-text/70 dark:text-dark-text/70 text-center mb-8">
              Here you can view all the ratings given to you by recruiters for
              the interviews you conducted.
            </p>

            {error && <Alert message={error.data?.message} />}

            <Table
              columns={columns}
              data={ratingsData?.interviewerRatings || []}
              actions={actions}
            />
          </div>
        )}

        {showDetails && selectedRating && (
          <Modal
            isOpen={showDetails}
            onClose={() => setShowDetails(false)}
            title="Rating Details"
          >
            {selectedRating && (
              <div className="space-y-4 text-left">
                <div className="border-b border-light-border dark:border-dark-border pb-4">
                  <div className="flex items-start">
                    <div className="w-6 min-w-[24px] flex justify-center mt-1 mr-4">
                      <FaUser
                        className="text-light-primary dark:text-dark-primary"
                        size={20}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Interviewer
                      </p>
                      <p className="text-lg font-medium text-light-text dark:text-dark-text break-words">
                        {selectedRating.interviewer.firstName}{' '}
                        {selectedRating.interviewer.lastName}
                      </p>
                      <p className="text-sm text-light-secondary dark:text-dark-secondary mt-1">
                        {selectedRating.interviewer.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-b border-light-border dark:border-dark-border pb-4 break-words">
                  <div className="flex items-start">
                    <div className="w-6 min-w-[24px] flex justify-center mt-1 mr-4">
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
                      <p className="text-sm text-light-secondary dark:text-dark-secondary mt-1">
                        {selectedRating.job.company}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-b border-light-border dark:border-dark-border pb-4">
                  <div className="flex items-start">
                    <div className="w-6 min-w-[24px] flex justify-center mt-1 mr-4">
                      <FaClipboardList
                        className="text-light-primary dark:text-dark-primary"
                        size={20}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Contract ID
                      </p>
                      <p className="text-lg font-medium text-light-text dark:text-dark-text break-words">
                        {selectedRating.contractId}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-b border-light-border dark:border-dark-border pb-4">
                  <div className="flex items-start">
                    <div className="w-6 min-w-[24px] flex justify-center mt-1 mr-4">
                      <FaStar
                        className="text-light-primary dark:text-dark-primary"
                        size={20}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Rating
                      </p>
                      <span className="text-lg font-medium text-light-text dark:text-dark-text inline-block mt-1">
                        {selectedRating.rating}/5
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-b border-light-border dark:border-dark-border pb-4">
                  <div className="flex items-start">
                    <div className="w-6 min-w-[24px] flex justify-center mt-1 mr-4">
                      <FaCommentDots
                        className="text-light-primary dark:text-dark-primary"
                        size={20}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Feedback
                      </p>
                      <p className="text-lg font-medium text-light-text dark:text-dark-text whitespace-pre-wrap break-words mt-1">
                        {selectedRating.feedback || 'No feedback provided.'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                    onClick={() => setShowDetails(false)}
                  >
                    <FaTimes />
                    Close
                  </button>
                </div>
              </div>
            )}
          </Modal>
        )}
      </section>
    </>
  );
}
