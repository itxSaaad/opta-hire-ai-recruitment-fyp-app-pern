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

  const { userInfo } = useSelector((state) => state.auth);

  const {
    data: interviewsData,
    isLoading,
    error,
    refetch,
  } = useGetAllInterviewsQuery({
    interviewerId: userInfo.id,
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
            className={`px-3 py-1 rounded flex items-center gap-1 ${
              isJoinable
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
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
        <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded flex items-center gap-1">
          <FaCalendarAlt />
          View Details
        </button>
      ),
    },
    {
      onClick: handleEdit,
      render: () => (
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1">
          <FaPencilAlt />
          Edit
        </button>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>Track Interviews [Interviewer] - OptaHire</title>
        <meta
          name="description"
          content="OptaHire Interviewer Interviews - Track and manage your interviews efficiently."
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
      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title="Interview Details"
      >
        {selectedInterview && (
          <div className="space-y-4 text-left">
            <div className="border-b border-light-border dark:border-dark-border pb-4 break-words">
              <div className="flex items-start">
                <div className="w-6 min-w-[24px] flex justify-center mt-1 mr-4">
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

            <div className="border-b border-light-border dark:border-dark-border pb-4 break-words">
              <div className="flex items-start">
                <div className="w-6 min-w-[24px] flex justify-center mt-1 mr-4">
                  <FaFileAlt
                    className="text-light-primary dark:text-dark-primary"
                    size={20}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Job Description
                  </p>
                  <p className="text-lg font-medium text-light-text dark:text-dark-text whitespace-pre-wrap">
                    {selectedInterview.job.description || 'Not set'}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-light-border dark:border-dark-border pb-4">
              <div className="flex items-start">
                <div className="w-6 min-w-[24px] flex justify-center mt-1 mr-4">
                  <FaUser
                    className="text-light-primary dark:text-dark-primary"
                    size={20}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Candidate Name
                  </p>
                  <p className="text-lg font-medium text-light-text dark:text-dark-text break-words">
                    {selectedInterview.candidate.firstName}{' '}
                    {selectedInterview.candidate.lastName}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-light-border dark:border-dark-border pb-4 break-words">
              <div className="flex items-start">
                <div className="w-6 min-w-[24px] flex justify-center mt-1 mr-4">
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

            <div className="border-b border-light-border dark:border-dark-border pb-4">
              <div className="flex items-start">
                <div className="w-6 min-w-[24px] flex justify-center mt-1 mr-4">
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

            <div className="border-b border-light-border dark:border-dark-border pb-4">
              <div className="flex items-start">
                <div className="w-6 min-w-[24px] flex justify-center mt-1 mr-4">
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
                    className={`text-sm font-semibold px-3 py-1 inline-block rounded-full mt-1 ${
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

            <div className="border-b border-light-border dark:border-dark-border pb-4">
              <div className="flex items-start">
                <div className="w-6 min-w-[24px] flex justify-center mt-1 mr-4">
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
              <div className="border-b border-light-border dark:border-dark-border pb-4">
                <div className="flex items-start">
                  <div className="w-6 min-w-[24px] flex justify-center mt-1 mr-4">
                    <FaClipboard
                      className="text-light-primary dark:text-dark-primary"
                      size={20}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Summary
                    </p>
                    <p className="text-lg font-medium text-light-text dark:text-dark-text whitespace-pre-wrap break-words">
                      {selectedInterview.summary}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedInterview.remarks && (
              <div className="border-b border-light-border dark:border-dark-border pb-4">
                <div className="flex items-start">
                  <div className="w-6 min-w-[24px] flex justify-center mt-1 mr-4">
                    <FaCommentDots
                      className="text-light-primary dark:text-dark-primary"
                      size={20}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Remarks
                    </p>
                    <p className="text-lg font-medium text-light-text dark:text-dark-text whitespace-pre-wrap break-words">
                      {selectedInterview.remarks}
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-all duration-200"
                onClick={() => setShowEditModal(false)}
                disabled={isUpdating}
              >
                <FaTimes />
                Cancel
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-light-primary dark:bg-dark-primary hover:bg-light-secondary dark:hover:bg-dark-secondary text-white rounded transition-all duration-200"
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
