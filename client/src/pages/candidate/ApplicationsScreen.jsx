import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

import ErrorMsg from '../../components/ErrorMsg';
import Loader from '../../components/Loader';
import Table from '../../components/ui/dashboardLayout/Table';

import { useGetAllApplicationsQuery } from '../../features/application/applicationApi';
import { trackPageView } from '../../utils/analytics';

export default function CandidateApplicationsScreen() {
  const { data: applications, isLoading, error } = useGetAllApplicationsQuery();
  console.log(applications, 'applications data');

  useEffect(() => {
    trackPageView(window.location.pathname);
  }, []);

  const columns = [
    {
      key: 'jobTitle',
      label: 'Job Title',
      render: (application) => application.job.title,
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
          {application.status}
        </span>
      ),
    },
    {
      key: 'applicationDate',
      label: 'Applied On',
      render: (application) =>
        new Date(application.applicationDate).toLocaleDateString(),
    },
  ];

  return (
    <>
      <Helmet>
        <title>Your Applications - OptaHire</title>
        <meta
          name="description"
          content="Review your job application history"
        />
      </Helmet>

      <section className="min-h-screen flex flex-col items-center py-24 px-4 bg-light-background dark:bg-dark-background animate-fadeIn">
        {isLoading ? (
          <div className="w-full max-w-sm sm:max-w-md mx-auto">
            <Loader />
          </div>
        ) : (
          <div className="w-full max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-light-text dark:text-dark-text text-center">
              Your Applications
            </h1>

            {error && <ErrorMsg errorMsg={error.data?.message} />}

            <Table columns={columns} data={applications?.applications || []} />
          </div>
        )}
      </section>
    </>
  );
}
