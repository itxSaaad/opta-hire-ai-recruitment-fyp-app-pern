import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaBriefcase,
  FaClipboardList,
  FaCommentDots,
  FaPlus,
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
import InputField from '../../components/ui/mainLayout/InputField';

import { trackEvent, trackPageView } from '../../utils/analytics';

import { useGetAllContractsQuery } from '../../features/contract/contractApi';
import {
  useCreateRatingMutation,
  useGetAllRatingsQuery,
} from '../../features/interviewerRating/interviewerRatingApi';

export default function RatingsScreen() {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    interviewerId: '',
    jobId: '',
    contractId: '',
    rating: '',
    feedback: '',
  });
  const [selectedContract, setSelectedContract] = useState(null);

  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);

  const {
    data: ratingsData,
    isLoading,
    error,
    refetch,
  } = useGetAllRatingsQuery({
    recruiterId: userInfo.id,
  });

  const { data: contractsData, isLoading: isLoadingContracts } =
    useGetAllContractsQuery({
      recruiterId: userInfo.id,
    });

  const [createRating, { isLoading: isCreating, error: createError }] =
    useCreateRatingMutation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  const handleDetails = (rating) => {
    setSelectedRating(rating);
    setShowDetails(true);
  };

  const handleCreateRating = () => {
    setShowCreateModal(true);
    setFormData({
      interviewerId: '',
      jobId: '',
      contractId: '',
      rating: '',
      feedback: '',
    });
    setSelectedContract(null);
    trackEvent('Create Rating', 'User Action', 'Opened create rating form');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleContractChange = (e) => {
    const contractId = e.target.value;
    if (!contractId) {
      setSelectedContract(null);
      setFormData({
        ...formData,
        contractId: '',
        interviewerId: '',
        jobId: '',
      });
      return;
    }

    const contract = contractsData.contracts.find((c) => c.id === contractId);
    if (contract) {
      setSelectedContract(contract);
      setFormData({
        ...formData,
        contractId: contractId,
        interviewerId: contract.interviewerId,
        jobId: contract.jobId,
      });
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    try {
      await createRating({
        recruiterId: userInfo.id,
        ...formData,
      }).unwrap();
      setShowCreateModal(false);
      setFormData({
        interviewerId: '',
        jobId: '',
        contractId: '',
        rating: '',
        feedback: '',
      });
      setSelectedContract(null);
      refetch();
      trackEvent(
        'Rating Created',
        'User Action',
        'Successfully created rating'
      );
    } catch (err) {
      console.error(err);
      trackEvent(
        'Rating Creation Failed',
        'User Action',
        'Failed to create rating'
      );
    }
  };

  const columns = [
    {
      key: 'interviewer',
      label: 'Interviewer',
      render: (rating) => (
        <span className="text-light-text/70 dark:text-dark-text/70">
          {`${rating.interviewer.firstName} ${rating.interviewer.lastName}`}
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
        <title>Interviewer Ratings - OptaHire | Rate Interview Quality</title>
        <meta
          name="description"
          content="Rate interviewer performance on OptaHire. Provide feedback to maintain high-quality interview standards and build trust."
        />
        <meta
          name="keywords"
          content="OptaHire Interviewer Ratings, Interview Quality, Performance Feedback, Professional Reviews, Quality Assurance"
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
              Rate{' '}
              <span className="text-light-primary dark:text-dark-primary">
                Interviewers
              </span>
            </h1>
            <p className="mb-8 text-center text-lg text-light-text/70 dark:text-dark-text/70">
              Rate interviewer performance and help maintain exceptional
              interview quality standards on our platform.
            </p>

            <button
              onClick={handleCreateRating}
              className="mb-4 flex items-center gap-2 rounded bg-light-primary px-4 py-2 text-white transition hover:bg-light-secondary dark:bg-dark-primary dark:hover:bg-dark-secondary"
              disabled={isCreating}
            >
              <FaPlus /> Rate Interviewer
            </button>

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

        {/* Create Rating Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Rate Interviewer"
        >
          {isCreating || isLoadingContracts ? (
            <Loader />
          ) : (
            <form onSubmit={handleSubmitRating} className="space-y-4 p-4">
              {createError && (
                <Alert
                  isSuccess={false}
                  message={
                    createError.data?.message || 'Failed to create rating'
                  }
                />
              )}

              <InputField
                id="contractId"
                type="select"
                label="Select Contract"
                value={formData.contractId}
                onChange={handleContractChange}
                options={[
                  { value: '', label: 'Select a contract' },
                  ...(contractsData?.contracts || []).map((contract) => ({
                    value: contract.id,
                    label: `${contract.job.title} - ${contract.interviewer.firstName} ${contract.interviewer.lastName}`,
                  })),
                ]}
              />

              {selectedContract && (
                <div className="mb-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <h3 className="mb-2 font-medium">Contract Details</h3>
                  <p>
                    <strong>Job:</strong> {selectedContract.job.title}
                  </p>
                  <p>
                    <strong>Interviewer:</strong>{' '}
                    {selectedContract.interviewer.firstName}{' '}
                    {selectedContract.interviewer.lastName}
                  </p>
                  <p>
                    <strong>Status:</strong> {selectedContract.status}
                  </p>
                </div>
              )}

              <InputField
                id="rating"
                label="Rating (1-5)"
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={handleInputChange}
              />

              <InputField
                id="feedback"
                label="Feedback"
                type="textarea"
                rows={4}
                value={formData.feedback}
                onChange={handleInputChange}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded bg-gray-300 px-4 py-2 text-gray-800 transition hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded bg-light-primary px-4 py-2 text-white transition hover:bg-light-secondary dark:bg-dark-primary dark:hover:bg-dark-secondary"
                  disabled={!selectedContract}
                >
                  <FaStar /> Submit Rating
                </button>
              </div>
            </form>
          )}
        </Modal>
      </section>
    </>
  );
}
