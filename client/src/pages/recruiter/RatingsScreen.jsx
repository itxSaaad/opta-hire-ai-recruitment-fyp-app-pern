import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaPlus, FaStar } from 'react-icons/fa';
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
        <title>Manage Interviewer Ratings [Recruiter] - OptaHire</title>
        <meta
          name="description"
          content="OptaHire Recruiter Ratings - Manage and view all interviewer ratings in one place."
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
              Manage{' '}
              <span className="text-light-primary dark:text-dark-primary">
                Interviewer Ratings
              </span>
            </h1>
            <p className="text-lg text-light-text/70 dark:text-dark-text/70 text-center mb-8">
              View and manage all the ratings given to interviewers in one
              place.
            </p>
            <button
              onClick={handleCreateRating}
              className="mb-4 px-4 py-2 bg-light-primary dark:bg-dark-primary text-white rounded hover:bg-light-secondary dark:hover:bg-dark-secondary transition flex items-center gap-2"
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
            <div className="p-4">
              <h2 className="text-xl font-bold mb-2">
                {`${selectedRating.interviewer.firstName} ${selectedRating.interviewer.lastName}`}
              </h2>
              <p className="text-light-text/70 dark:text-dark-text/70 mb-4">
                {`Rating: ${selectedRating.rating} / 5`}
              </p>
              <p>{selectedRating.feedback}</p>
            </div>
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
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                  <h3 className="font-medium mb-2">Contract Details</h3>
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
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-light-primary dark:bg-dark-primary text-white rounded hover:bg-light-secondary dark:hover:bg-dark-secondary transition flex items-center gap-2"
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
