import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import Table from '../../components/ui/dashboardLayout/Table';

import { trackPageView } from '../../utils/analytics';

import { useGetAllApplicationsQuery } from '../../features/application/applicationApi';

export default function CandidateApplicationsScreen() {
  const location = useLocation();

  const {
    data: applications,
    isLoading,
    error,
  } = useGetAllApplicationsQuery({
    role: 'candidate',
  });

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  const columns = [
    {
      key: 'jobTitle',
      label: 'Job Title',
      render: (application) => (
        <span className="font-medium text-light-text dark:text-dark-text">
          {application.job.title}
        </span>
      ),
    },
    {
      key: 'companyName',
      label: 'Company Name',
      render: (application) => (
        <span className="text-light-text/70 dark:text-dark-text/70">
          {application.job.company}
        </span>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (application) => application.job.category,
    },
    {
      key: 'location',
      label: 'Location',
      render: (application) => application.job.location,
    },
    {
      key: 'status',
      label: 'Status',
      render: (application) => (
        <span
          className={`rounded px-2.5 py-0.5 text-xs font-medium ${
            application.status === 'applied'
              ? 'bg-blue-100 text-blue-800'
              : application.status === 'shortlisted'
                ? 'bg-green-100 text-green-800'
                : application.status === 'accepted'
                  ? 'bg-teal-100 text-teal-800'
                  : application.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
          }`}
        >
          {application.status.charAt(0).toUpperCase() +
            application.status.slice(1).toLowerCase()}
        </span>
      ),
    },
    {
      key: 'applicationDate',
      label: 'Applied On',
      render: (application) => (
        <span className="text-light-text/70 dark:text-dark-text/70">
          {new Date(application.applicationDate).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>My Applications - OptaHire | Track Application Status</title>
        <meta
          name="description"
          content="Track all your job applications on OptaHire. Monitor application status, interview schedules, and hiring progress in real-time."
        />
        <meta
          name="keywords"
          content="OptaHire My Applications, Application Status, Job Tracking, Application History, Interview Status"
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
                Applications
              </span>
            </h1>
            <p className="mb-8 text-center text-lg text-light-text/70 dark:text-dark-text/70">
              Track the status of all your job applications and stay updated on
              your hiring progress.
            </p>

            {error && <Alert message={error.data?.message} />}

            <Table columns={columns} data={applications?.applications || []} />
          </div>
        )}
      </section>
    </>
  );
}
