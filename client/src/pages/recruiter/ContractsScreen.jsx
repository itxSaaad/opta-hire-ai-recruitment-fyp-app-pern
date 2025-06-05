import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaCheckCircle, FaCreditCard } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import Table from '../../components/ui/dashboardLayout/Table';

import { trackEvent, trackPageView } from '../../utils/analytics';

import {
  useGetAllContractsQuery,
  useUpdateContractByIdMutation,
} from '../../features/contract/contractApi';

export default function ContractsScreen() {
  const location = useLocation();
  const user = useSelector((state) => state.auth.userInfo);

  const {
    data: contractsData,
    isLoading,
    error,
    refetch,
  } = useGetAllContractsQuery({
    recruiterId: user.id,
  });

  const [
    updateContract,
    {
      isLoading: isUpdating,
      isSuccess,
      data: updatedContract,
      error: updateError,
    },
  ] = useUpdateContractByIdMutation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  // Handle contract completion
  const handleCompleteContract = async (contract) => {
    await updateContract({
      id: contract.id,
      contractData: { status: 'completed' },
    }).unwrap();

    trackEvent(
      'Contract Completed',
      'Contract Action',
      `Completed contract for ${contract.job.title}`
    );

    // Refetch data to show updated status
    refetch();
  };

  // Handle payment (placeholder for now)
  const handlePayContract = (contract) => {
    trackEvent(
      'Payment Processed',
      'Contract Action',
      `Processed payment for contract ${contract.job.title}`
    );
  };

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
      key: 'interviewer',
      label: 'Interviewer',
      render: (contract) => (
        <span className="text-light-text/70 dark:text-dark-text/70">
          {`${contract.interviewer.firstName} ${contract.interviewer.lastName}`}
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
          className={`rounded px-2.5 py-0.5 text-xs font-medium ${
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
          className={`rounded px-2.5 py-0.5 text-xs font-medium ${
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

  const actions = [
    {
      onClick: handleCompleteContract,
      render: (contract) => (
        <button
          className={`flex items-center gap-1 rounded px-3 py-1 ${
            contract.status !== 'active'
              ? 'cursor-not-allowed bg-gray-400 text-white'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
          disabled={contract.status !== 'active'}
        >
          <FaCheckCircle />
          Mark as Completed
        </button>
      ),
    },
    {
      onClick: handlePayContract,
      render: (contract) => (
        <button
          className={`flex items-center gap-1 rounded px-3 py-1 ${
            contract.paymentStatus === 'paid' ||
            contract.status === 'pending' ||
            contract.status === 'cancelled'
              ? 'cursor-not-allowed bg-gray-400 text-white'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          disabled={
            contract.paymentStatus === 'paid' ||
            contract.status === 'pending' ||
            contract.status === 'cancelled'
          }
        >
          <FaCreditCard />
          Pay for Contract
        </button>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>Manage Contracts [Recruiter] - OptaHire</title>
        <meta
          name="description"
          content="OptaHire Recruiter Contracts - View and track all your recruitment contracts, payment statuses, and transaction history in one place."
        />
        <meta
          name="keywords"
          content="contracts, payment status, transaction history, manage contracts, recruiter dashboard"
        />
      </Helmet>

      <section className="flex min-h-screen animate-fadeIn flex-col items-center bg-light-background px-4 py-24 dark:bg-dark-background">
        {isLoading || isUpdating ? (
          <div className="relative w-full max-w-sm animate-fadeIn sm:max-w-md">
            <Loader />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-7xl animate-slideUp">
            <h1 className="mb-6 text-center text-3xl font-bold text-light-text dark:text-dark-text sm:text-4xl md:text-5xl">
              Manage Your{' '}
              <span className="text-light-primary dark:text-dark-primary">
                Contracts
              </span>
            </h1>
            <p className="mb-8 text-center text-lg text-light-text/70 dark:text-dark-text/70">
              View and track all your recruitment contracts, payment statuses,
              and transaction history in one place.
            </p>

            {error ||
              (updateError && (
                <Alert
                  message={error.data?.message || updateError.data?.message}
                />
              ))}

            {isSuccess && updatedContract && (
              <Alert
                isSuccess={isSuccess}
                message={
                  updateContract.data?.message ||
                  'Contract updated successfully!'
                }
              />
            )}

            <Table
              columns={columns}
              data={contractsData?.contracts || []}
              actions={actions}
            />
          </div>
        )}
      </section>
    </>
  );
}
