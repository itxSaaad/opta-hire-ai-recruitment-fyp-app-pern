import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaArrowLeft,
  FaBriefcase,
  FaCheckCircle,
  FaClipboardList,
  FaEnvelope,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';

import { trackEvent, trackPageView } from '../../utils/analytics';

import { useGetJobByIdQuery } from '../../features/job/jobApi';

export default function ApplicationSuccess() {
  const { jobId } = useParams();

  const {
    data: jobData,
    isLoading,
    error,
  } = useGetJobByIdQuery(jobId, {
    skip: !jobId,
  });

  useEffect(() => {
    trackPageView(window.location.pathname);
  }, []);

  return (
    <>
      <Helmet>
        <title>Application Successful [Candidate] - OptaHire</title>
        <meta
          name="description"
          content="Your application has been submitted successfully."
        />
      </Helmet>

      <section className="min-h-screen flex items-center justify-center py-24 px-4 bg-light-background dark:bg-dark-background animate-fadeIn">
        {isLoading ? (
          <div className="w-full max-w-sm sm:max-w-md mx-auto">
            <Loader />
          </div>
        ) : (
          <div className="max-w-4xl w-full mx-auto text-center bg-light-surface dark:bg-dark-surface p-8 rounded-lg shadow-lg border border-light-border dark:border-dark-border transition-all duration-500 hover:shadow-xl animate-slideUp">
            {error && <Alert message={error?.data?.message} />}

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-0.5 w-full bg-green-100 dark:bg-green-900"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-green-100 dark:bg-green-900 rounded-full p-4">
                  <FaCheckCircle className="text-green-500 mx-auto" size={64} />
                </span>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">
              Application{' '}
              <span className="text-light-primary dark:text-dark-primary">
                Successful!
              </span>
            </h1>

            {jobData?.job && (
              <div className="mb-6 p-6 bg-light-background dark:bg-dark-background rounded-lg transition-all duration-300 hover:shadow-md">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">
                      {jobData.job.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-medium text-light-secondary dark:text-dark-secondary">
                        {jobData.job.company}
                      </span>
                      <span className="text-light-text dark:text-dark-text opacity-60">
                        •
                      </span>
                      <span className="text-sm flex items-center gap-1 text-light-text dark:text-dark-text opacity-60">
                        <FaMapMarkerAlt /> {jobData.job.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-light-primary bg-opacity-10 text-light-primary dark:text-dark-primary text-xs font-medium px-3 py-1 rounded-full flex items-center">
                      <FaBriefcase className="mr-1" />{' '}
                      {jobData.job.category || 'Full-time'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <p className="text-lg text-light-text dark:text-dark-text mb-8">
              Thank you for applying. We have received your application and will
              be in touch soon.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-light-background dark:bg-dark-background rounded-lg transition-all duration-300 hover:shadow-md flex items-center">
                <FaEnvelope
                  className="text-light-primary dark:text-dark-primary mr-3"
                  size={24}
                />
                <div className="text-left">
                  <h3 className="font-medium text-light-text dark:text-dark-text">
                    Next Steps
                  </h3>
                  <p className="text-sm text-light-text/70 dark:text-dark-text/70">
                    Check your email for updates on your application status
                  </p>
                </div>
              </div>
              <div className="p-4 bg-light-background dark:bg-dark-background rounded-lg transition-all duration-300 hover:shadow-md flex items-center">
                <FaClipboardList
                  className="text-light-primary dark:text-dark-primary mr-3"
                  size={24}
                />
                <div className="text-left">
                  <h3 className="font-medium text-light-text dark:text-dark-text">
                    Application Tracking
                  </h3>
                  <p className="text-sm text-light-text/70 dark:text-dark-text/70">
                    Monitor your application status in your dashboard
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/candidate/dashboard"
                onClick={() =>
                  trackEvent(
                    'Application Success',
                    'Go to Dashboard',
                    'User clicked on Go to Dashboard button'
                  )
                }
                className="px-6 py-3 bg-light-primary dark:bg-dark-primary text-white rounded-lg hover:bg-light-secondary dark:hover:bg-dark-secondary transition-all duration-300 font-medium hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Go to Dashboard
              </Link>
              <Link
                to="/candidate/applications"
                onClick={() =>
                  trackEvent(
                    'Application Success',
                    'View All Applications',
                    'User clicked on View All Applications button'
                  )
                }
                className="px-6 py-3 border border-light-primary dark:border-dark-primary text-light-primary dark:text-dark-primary rounded-lg hover:bg-light-primary/10 dark:hover:bg-dark-primary/10 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <FaArrowLeft size={16} />
                View All Applications
              </Link>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
