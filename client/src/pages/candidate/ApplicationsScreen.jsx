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
          className={`text-xs font-medium px-2.5 py-0.5 rounded ${
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
        <title>Track Your Applications [Candidate] - OptaHire</title>
        <meta
          name="description"
          content="Track your job applications and stay updated on your application status."
        />
        <meta
          name="keywords"
          content="job applications, application tracking, job status, candidate dashboard"
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
                Applications
              </span>
            </h1>
            <p className="text-lg text-light-text/70 dark:text-dark-text/70 text-center mb-8">
              Keep track of your job applications and their status.
            </p>

            {error && <Alert message={error.data?.message} />}

            <Table columns={columns} data={applications?.applications || []} />
          </div>
        )}
      </section>
    </>
  );
}
