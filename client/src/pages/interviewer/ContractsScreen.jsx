import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import Table from '../../components/ui/dashboardLayout/Table';

import { trackPageView } from '../../utils/analytics';

import { useGetAllContractsQuery } from '../../features/contract/contractApi';

export default function ContractsScreen() {
  const location = useLocation();

  const { data: contractsData, isLoading, error } = useGetAllContractsQuery();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  const columns = [
    {
      key: 'jobTitle',
      label: 'Job Title',
      render: (contract) => (
        <span className="font-medium text-light-text dark:text-dark-text">
          {contract.job.title}
        </span>
      ),
    },
    {
      key: 'recruiter',
      label: 'Recruiter',
      render: (contract) => (
        <span className="text-light-text/70 dark:text-dark-text/70">
          {`${contract.recruiter.firstName} ${contract.recruiter.lastName}`}
        </span>
      ),
    },
    {
      key: 'agreedPrice',
      label: 'Agreed Price',
      render: (contract) => (
        <span className="text-light-text/70 dark:text-dark-text/70">
          ${contract.agreedPrice}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (contract) => (
        <span
          className={`text-xs font-medium px-2.5 py-0.5 rounded ${
            contract.status === 'pending'
              ? 'bg-blue-100 text-blue-800'
              : contract.status === 'active'
                ? 'bg-green-100 text-green-800'
                : contract.status === 'completed'
                  ? 'bg-teal-100 text-teal-800'
                  : contract.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
          }`}
        >
          {contract.status.charAt(0).toUpperCase() +
            contract.status.slice(1).toLowerCase()}
        </span>
      ),
    },
    {
      key: 'paymentStatus',
      label: 'Payment Status',
      render: (contract) => (
        <span
          className={`text-xs font-medium px-2.5 py-0.5 rounded ${
            contract.paymentStatus === 'paid'
              ? 'bg-green-100 text-green-800'
              : contract.paymentStatus === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : contract.paymentStatus === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : contract.paymentStatus === 'refunded'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800'
          }`}
        >
          {contract.paymentStatus.charAt(0).toUpperCase() +
            contract.paymentStatus.slice(1).toLowerCase()}
        </span>
      ),
    },
    {
      key: 'transactions',
      label: 'Latest Transaction',
      render: (contract) => {
        const latestTransaction = contract.transactions?.[0];
        return latestTransaction ? (
          <span className="text-light-text/70 dark:text-dark-text/70">
            ${latestTransaction.amount} (
            {new Date(latestTransaction.transactionDate).toLocaleDateString()})
          </span>
        ) : (
          <span className="text-light-text/70 dark:text-dark-text/70">-</span>
        );
      },
    },
  ];

  return (
    <>
      <Helmet>
        <title>Manage Contracts [Interviewer] - OptaHire</title>
        <meta
          name="description"
          content="OptaHire Interviewer Contracts - View and track all your recruitment contracts, payment statuses, and transaction history in one place."
        />
        <meta
          name="keywords"
          content="contracts, payment status, transaction history, manage contracts, interviewer dashboard"
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
              Manage Your{' '}
              <span className="text-light-primary dark:text-dark-primary">
                Contracts
              </span>
            </h1>
            <p className="text-lg text-light-text/70 dark:text-dark-text/70 text-center mb-8">
              View and track all your recruitment contracts, payment statuses,
              and transaction history in one place.
            </p>

            {error && <Alert message={error.data?.message} />}

            <Table columns={columns} data={contractsData?.contracts || []} />
          </div>
        )}
      </section>
    </>
  );
}
