import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaCalendarAlt,
  FaClipboardList,
  FaClock,
  FaSave,
  FaStar,
  FaStarHalfAlt,
  FaTimes,
  FaUser,
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import InputField from '../../components/ui/mainLayout/InputField';

import { trackEvent, trackPageView } from '../../utils/analytics';
import { validateRating, validateSummary } from '../../utils/validations';

import {
  useGetAllInterviewsQuery,
  useUpdateInterviewMutation,
} from '../../features/interview/interviewApi';

export default function FeedbackScreen() {
  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    summary: '',
  });
  const [errors, setErrors] = useState({
    rating: '',
    summary: '',
    form: '',
  });
  const [feedbackAlreadyGiven, setFeedbackAlreadyGiven] = useState(false);

  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);

  const {
    data: interviews,
    isLoading,
    error,
  } = useGetAllInterviewsQuery({
    interviewerId: userInfo.id,
    roomId,
  });

  const [
    updateInterview,
    { isLoading: isUpdating, error: updateError, isSuccess, data: updateData },
  ] = useUpdateInterviewMutation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  const handleChange = (field, value) => {
    setFeedbackData({
      ...feedbackData,
      [field]: value,
    });
  };

  useEffect(() => {
    if (interviews) {
      const interview = interviews.interviews[0];

      if (interview.rating || interview.summary) {
        setFeedbackData({
          rating: interview.rating || 0,
          summary: interview.summary || '',
        });

        if (
          (interview.rating > 0 || interview.summary) &&
          interview.status === 'completed'
        ) {
          setFeedbackAlreadyGiven(true);
        }
      }
    }
  }, [interviews]);

  const handleStarClick = (rating) => {
    handleChange('rating', rating);
  };

  const validateForm = () => {
    const ratingError = validateRating(feedbackData.rating);
    const summaryError = validateSummary(feedbackData.summary);

    setErrors({
      rating: ratingError,
      summary: summaryError,
      form: '',
    });

    return !ratingError && !summaryError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!interviews?.interviews[0]?.id) {
      setErrors({
        ...errors,
        form: 'Interview data not found. Please try again.',
      });
      return;
    }

    try {
      const result = await updateInterview({
        id: interviews.interviews[0].id,
        interviewData: {
          rating: parseFloat(feedbackData.rating),
          summary: feedbackData.summary,
          status: 'completed',
        },
      }).unwrap();

      if (result.success) {
        trackEvent(
          'Interview',
          'Submit Feedback',
          'Feedback submitted successfully'
        );

        setTimeout(() => {
          navigate('/interviewer/dashboard');
        }, 3000);
      }
    } catch (err) {
      setErrors({
        ...errors,
        form:
          err.data?.message || 'Failed to submit feedback. Please try again.',
      });
      trackEvent('Interview', 'Feedback Error', `Error: ${err.message}`);
    }
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(feedbackData.rating);
    const hasHalfStar = feedbackData.rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <FaStar
            key={i}
            className="cursor-pointer text-2xl text-yellow-400"
            onClick={() => handleStarClick(i)}
          />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <FaStarHalfAlt
            key={i}
            className="cursor-pointer text-2xl text-yellow-400"
            onClick={() => handleStarClick(i)}
          />
        );
      } else {
        stars.push(
          <FaStar
            key={i}
            className="cursor-pointer text-2xl text-gray-300 dark:text-gray-600"
            onClick={() => handleStarClick(i)}
          />
        );
      }
    }

    return stars;
  };

  const isFormValid =
    feedbackData.rating > 0 &&
    feedbackData.summary.trim() !== '' &&
    !errors.rating &&
    !errors.summary;

  return (
    <>
      <Helmet>
        <title>Interview Feedback - OptaHire | Performance Review</title>
        <meta
          name="description"
          content="View your interview feedback on OptaHire. Get detailed performance insights and recommendations for improvement."
        />
        <meta
          name="keywords"
          content="OptaHire Interview Feedback, Performance Review, Interview Results, Career Development, Interview Assessment"
        />
      </Helmet>

      <section className="flex min-h-screen items-center justify-center bg-light-background px-4 py-24 dark:bg-dark-background">
        {isLoading ? (
          <div className="mx-auto w-full max-w-sm sm:max-w-md">
            <Loader />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-5xl animate-fadeIn">
            <h1 className="mb-6 text-center text-3xl font-bold text-light-text dark:text-dark-text sm:text-4xl md:text-5xl">
              Interview{' '}
              <span className="text-light-primary dark:text-dark-primary">
                Feedback
              </span>
            </h1>
            <p className="mb-8 text-center text-lg text-light-text/70 dark:text-dark-text/70">
              Review your interview performance and get valuable insights to
              enhance your future interviews.
            </p>

            {(error || updateError || errors.form) && (
              <Alert
                message={
                  error?.data?.message ||
                  updateError?.data?.message ||
                  errors.form
                }
              />
            )}

            {isSuccess && updateData.data?.message && (
              <Alert isSuccess={isSuccess} message={updateData.data.message} />
            )}

            <div className="animate-slideIn rounded-lg border border-light-border bg-light-surface p-8 shadow-lg dark:border-dark-border dark:bg-dark-surface">
              {interviews?.interviews && interviews.interviews.length > 0 ? (
                <>
                  <div className="mb-8 rounded-lg bg-light-background p-4 dark:bg-dark-background">
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-light-text dark:text-dark-text">
                          {interviews.interviews[0].job.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="font-medium text-light-secondary dark:text-dark-secondary">
                            {interviews.interviews[0].job?.company || 'Company'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-light-primary dark:text-dark-primary" />
                        <span className="text-light-text dark:text-dark-text">
                          Candidate:{' '}
                          {interviews.interviews[0].candidate.firstName}{' '}
                          {interviews.interviews[0].candidate.lastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-light-primary dark:text-dark-primary" />
                        <span className="text-light-text dark:text-dark-text">
                          Scheduled Date:{' '}
                          {new Date(
                            interviews.interviews[0].scheduledTime
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaClock className="text-light-primary dark:text-dark-primary" />
                        <span className="text-light-text dark:text-dark-text">
                          Scheduled Time:{' '}
                          {new Date(
                            interviews.interviews[0].scheduledTime
                          ).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaClipboardList className="text-light-primary dark:text-dark-primary" />
                        <span className="text-light-text dark:text-dark-text">
                          Status:{' '}
                          {interviews.interviews[0].status
                            .charAt(0)
                            .toUpperCase() +
                            interviews.interviews[0].status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {feedbackAlreadyGiven ? (
                    <div className="animate-slideIn p-8 text-center">
                      <FaClipboardList
                        className="mx-auto mb-4 text-light-primary dark:text-dark-primary"
                        size={48}
                      />
                      <h2 className="mb-2 text-xl font-bold text-light-text dark:text-dark-text">
                        Feedback Already Submitted
                      </h2>
                      <p className="mb-6 text-light-text/70 dark:text-dark-text/70">
                        You have already provided feedback for this interview.
                        Thank you for your assessment.
                      </p>
                      <button
                        onClick={() => navigate('/interviewer/dashboard')}
                        className="rounded-lg bg-light-primary px-6 py-3 text-white transition-all duration-300 hover:bg-light-secondary dark:bg-dark-primary dark:hover:bg-dark-secondary"
                      >
                        Return to Dashboard
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="mb-6">
                        <label className="mb-2 block text-lg font-medium text-light-text dark:text-dark-text">
                          Rating
                        </label>
                        <div className="mb-1 flex items-center gap-2">
                          {renderStars()}
                          <span className="ml-2 text-light-text dark:text-dark-text">
                            ({feedbackData.rating} / 5)
                          </span>
                        </div>
                        {errors.rating && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.rating}
                          </p>
                        )}
                      </div>

                      <div className="mb-6">
                        <InputField
                          id="summary"
                          type="textarea"
                          label="Feedback Summary"
                          value={feedbackData.summary}
                          onChange={(e) =>
                            handleChange('summary', e.target.value)
                          }
                          validationMessage={errors.summary}
                          rows={6}
                        />
                      </div>

                      <div className="flex justify-end gap-4">
                        <button
                          type="button"
                          onClick={() => navigate('/interviewer/dashboard')}
                          className="flex items-center gap-2 rounded-lg border border-light-primary px-6 py-3 text-light-primary transition-all duration-300 hover:bg-light-primary/10 dark:border-dark-primary dark:text-dark-primary dark:hover:bg-dark-primary/10"
                        >
                          <FaTimes size={16} />
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isUpdating || !isFormValid}
                          className={`flex items-center gap-2 rounded-lg bg-light-primary px-6 py-3 text-white transition-all duration-300 hover:bg-light-secondary dark:bg-dark-primary dark:hover:bg-dark-secondary ${
                            isUpdating || !isFormValid
                              ? 'cursor-not-allowed opacity-50'
                              : 'active:scale-98 shadow-md hover:shadow-lg'
                          }`}
                          onClick={() =>
                            trackEvent(
                              'Interview',
                              'Submit Feedback',
                              'User clicked Submit Feedback button'
                            )
                          }
                        >
                          {isUpdating ? (
                            <span>Submitting...</span>
                          ) : (
                            <>
                              <FaSave size={16} />
                              <span>Submit Feedback</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              ) : (
                <div className="animate-slideIn p-8 text-center">
                  <FaClipboardList
                    className="mx-auto mb-4 text-light-primary dark:text-dark-primary"
                    size={48}
                  />
                  <h2 className="mb-2 text-xl font-bold text-light-text dark:text-dark-text">
                    No Interview Found
                  </h2>
                  <p className="mb-6 text-light-text/70 dark:text-dark-text/70">
                    We couldn&apos;t find an interview with the provided room
                    ID.
                  </p>
                  <button
                    onClick={() => navigate('/interviewer/dashboard')}
                    className="rounded-lg bg-light-primary px-6 py-3 text-white transition-all duration-300 hover:bg-light-secondary dark:bg-dark-primary dark:hover:bg-dark-secondary"
                  >
                    Return to Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
