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
  FaPencilAlt,
  FaSave,
  FaStar,
  FaTimes,
  FaUser,
  FaVideo,
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import Table from '../../components/ui/dashboardLayout/Table';
import InputField from '../../components/ui/mainLayout/InputField';

import { trackEvent, trackPageView } from '../../utils/analytics';

import {
  useGetAllInterviewsQuery,
  useUpdateInterviewMutation,
} from '../../features/interview/interviewApi';

export default function InterviewsScreen() {
  const [showDetails, setShowDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);

  const [scheduledTime, setScheduledTime] = useState('');
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState('');
  const [rating, setRating] = useState('');

  const routeLocation = useLocation();
  const navigate = useNavigate();

  const {
    data: interviewsData,
    isLoading,
    error,
    refetch,
  } = useGetAllInterviewsQuery({
    interviewerId: useSelector((state) => state.auth.userInfo.id),
  });

  const [
    updateInterview,
    {
      isLoading: isUpdating,
      error: updateError,
      isSuccess: isUpdateSuccess,
      data: updateData,
    },
  ] = useUpdateInterviewMutation();

  useEffect(() => {
    trackPageView(routeLocation.pathname);
  }, [routeLocation.pathname]);

  useEffect(() => {
    if (selectedInterview) {
      setScheduledTime(selectedInterview.scheduledTime || '');
      setSummary(selectedInterview.summary || '');
      setStatus(selectedInterview.status || '');
      setRating(selectedInterview.rating || '');
    }
  }, [selectedInterview]);

  const handleDetails = (interview) => {
    setSelectedInterview(interview);
    setShowDetails(true);
    trackEvent(
      'View Interview Details',
      'User Action',
      `User clicked on interview ${interview.id} details button`
    );
  };

  const handleEdit = (interview) => {
    setSelectedInterview(interview);
    setShowEditModal(true);
    trackEvent(
      'Edit Interview',
      'User Action',
      'User clicked on edit interview button'
    );
  };

  const handleJoinInterview = (interview) => {
    navigate(`/interview/${interview.roomId}`);
    trackEvent('Join Interview', 'User Action', 'User joined interview');
  };

  const saveInterviewChanges = async () => {
    try {
      await updateInterview({
        id: selectedInterview.id,
        interviewData: {
          scheduledTime,
          summary,
          status,
          rating,
        },
      }).unwrap();
      setShowEditModal(false);
      refetch();
      trackEvent(
        'Update Interview',
        'User Action',
        `User updated interview ${selectedInterview.id}`
      );
    } catch (err) {
      console.error('Update failed:', err);
      trackEvent(
        'Update Interview Failed',
        'User Action',
        `User failed to update interview ${selectedInterview.id}`
      );
    }
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
      onClick: handleDetails,
      render: () => (
        <button className="flex items-center gap-1 rounded bg-indigo-500 px-3 py-1 text-white hover:bg-indigo-600">
          <FaCalendarAlt />
          View Details
        </button>
      ),
    },
    {
      onClick: handleEdit,
      render: () => (
        <button className="flex items-center gap-1 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600">
          <FaPencilAlt />
          Edit
        </button>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>My Interviews - OptaHire | Interview Schedule Management</title>
        <meta
          name="description"
          content="Manage your interview schedule on OptaHire. Track upcoming interviews, completed sessions, and optimize your interview business."
        />
        <meta
          name="keywords"
          content="OptaHire My Interviews, Interview Schedule, Interview Management, Interview Business, Professional Interviews"
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
                Interviews
              </span>
            </h1>
            <p className="mb-8 text-center text-lg text-light-text/70 dark:text-dark-text/70">
              Manage your interview schedule and track your professional
              interview sessions efficiently.
            </p>

            {(error || updateError) && (
              <Alert
                message={error?.data?.message || updateError?.data?.message}
              />
            )}

            {isUpdateSuccess && updateData?.data?.message && (
              <Alert
                message={updateData.data.message}
                isSuccess={isUpdateSuccess}
              />
            )}

            <Table
              columns={columns}
              data={interviewsData?.interviews || []}
              actions={actions}
            />
          </div>
        )}
      </section>

      {/* Details Modal */}
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

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Interview"
      >
        {isUpdating ? (
          <Loader />
        ) : (
          <div className="space-y-4">
            {updateError && <Alert message={updateError.data.message} />}
            <InputField
              id="scheduledTime"
              type="datetime-local"
              label="Scheduled Time"
              value={scheduledTime.substring(0, 16)}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
            <InputField
              id="summary"
              type="textarea"
              label="Summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
            <InputField
              id="status"
              type="select"
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'ongoing', label: 'Ongoing' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
            <InputField
              id="rating"
              type="number"
              label="Rating (0-5)"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="Enter rating"
            />
            <div className="flex justify-end space-x-2 pt-4">
              <button
                className="flex items-center gap-2 rounded bg-gray-300 px-4 py-2 text-gray-800 transition-all duration-200 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                onClick={() => setShowEditModal(false)}
                disabled={isUpdating}
              >
                <FaTimes />
                Cancel
              </button>
              <button
                className="flex items-center gap-2 rounded bg-light-primary px-4 py-2 text-white transition-all duration-200 hover:bg-light-secondary dark:bg-dark-primary dark:hover:bg-dark-secondary"
                onClick={saveInterviewChanges}
                disabled={isUpdating}
              >
                <FaSave />
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
