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
        <title>Application Submitted - OptaHire | Success Confirmation</title>
        <meta
          name="description"
          content="Application successfully submitted to OptaHire. Track your application status and prepare for potential interview opportunities."
        />
        <meta
          name="keywords"
          content="OptaHire Application Success, Application Submitted, Job Application Confirmation, Application Status"
        />
      </Helmet>

      <section className="flex min-h-screen animate-fadeIn items-center justify-center bg-light-background px-4 py-24 dark:bg-dark-background">
        {isLoading ? (
          <div className="mx-auto w-full max-w-sm sm:max-w-md">
            <Loader />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-4xl animate-slideUp rounded-lg border border-light-border bg-light-surface p-8 text-center shadow-lg transition-all duration-500 hover:shadow-xl dark:border-dark-border dark:bg-dark-surface">
            {error && <Alert message={error?.data?.message} />}

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-0.5 w-full bg-green-100 dark:bg-green-900"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="rounded-full bg-green-100 p-4 dark:bg-green-900">
                  <FaCheckCircle className="mx-auto text-green-500" size={64} />
                </span>
              </div>
            </div>

            <h1 className="mb-6 text-center text-3xl font-bold text-light-text dark:text-dark-text sm:text-4xl md:text-5xl">
              Application{' '}
              <span className="text-light-primary dark:text-dark-primary">
                Submitted
              </span>
            </h1>

            {jobData?.job && (
              <div className="mb-6 rounded-lg bg-light-background p-6 transition-all duration-300 hover:shadow-md dark:bg-dark-background">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">
                      {jobData.job.title}
                    </h2>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-medium text-light-secondary dark:text-dark-secondary">
                        {jobData.job.company}
                      </span>
                      <span className="text-light-text opacity-60 dark:text-dark-text">
                        •
                      </span>
                      <span className="flex items-center gap-1 text-sm text-light-text opacity-60 dark:text-dark-text">
                        <FaMapMarkerAlt /> {jobData.job.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="flex items-center rounded-full bg-light-primary bg-opacity-10 px-3 py-1 text-xs font-medium text-light-primary dark:text-dark-primary">
                      <FaBriefcase className="mr-1" />{' '}
                      {jobData.job.category || 'Full-time'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <p className="mb-8 text-lg text-light-text dark:text-dark-text">
              Thank you for applying. We have received your application and will
              be in touch soon.
            </p>

            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center rounded-lg bg-light-background p-4 transition-all duration-300 hover:shadow-md dark:bg-dark-background">
                <FaEnvelope
                  className="mr-3 text-light-primary dark:text-dark-primary"
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
              <div className="flex items-center rounded-lg bg-light-background p-4 transition-all duration-300 hover:shadow-md dark:bg-dark-background">
                <FaClipboardList
                  className="mr-3 text-light-primary dark:text-dark-primary"
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

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to="/candidate/dashboard"
                onClick={() =>
                  trackEvent(
                    'Application Success',
                    'Go to Dashboard',
                    'User clicked on Go to Dashboard button'
                  )
                }
                className="flex transform items-center justify-center gap-2 rounded-lg bg-light-primary px-6 py-3 font-medium text-white transition-all duration-300 hover:-translate-y-1 hover:bg-light-secondary hover:shadow-lg dark:bg-dark-primary dark:hover:bg-dark-secondary"
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
                className="flex items-center justify-center gap-2 rounded-lg border border-light-primary px-6 py-3 text-light-primary transition-all duration-300 hover:bg-light-primary/10 dark:border-dark-primary dark:text-dark-primary dark:hover:bg-dark-primary/10"
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
