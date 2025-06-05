import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaCheckCircle, FaMoneyBillWave, FaTimes } from 'react-icons/fa';
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
    interviewerId: user.id,
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

  // Handle contract acceptance
  const handleAcceptContract = async (contract) => {
    await updateContract({
      id: contract.id,
      contractData: { status: 'active' },
    }).unwrap();

    trackEvent(
      'Contract Accepted',
      'Contract Action',
      `Accepted contract for ${contract.job.title}`
    );

    refetch();
  };

  // Handle contract rejection
  const handleRejectContract = async (contract) => {
    await updateContract({
      id: contract.id,
      contractData: { status: 'cancelled' },
    }).unwrap();

    trackEvent(
      'Contract Rejected',
      'Contract Action',
      `Rejected contract for ${contract.job.title}`
    );

    refetch();
  };

  // Handle payment withdrawal (placeholder for now)
  const handleWithdrawPayment = (contract) => {
    trackEvent(
      'Payment Withdrawal Initiated',
      'Contract Action',
      `Initiated payment withdrawal for contract ${contract.job.title}`
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
      onClick: handleAcceptContract,
      render: (contract) => (
        <button
          className={`flex items-center gap-1 rounded px-3 py-1 ${
            contract.status !== 'pending'
              ? 'cursor-not-allowed bg-gray-400 text-white'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
          disabled={contract.status !== 'pending'}
        >
          <FaCheckCircle />
          Accept
        </button>
      ),
    },
    {
      onClick: handleRejectContract,
      render: (contract) => (
        <button
          className={`flex items-center gap-1 rounded px-3 py-1 ${
            contract.status !== 'pending'
              ? 'cursor-not-allowed bg-gray-400 text-white'
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
          disabled={contract.status !== 'pending'}
        >
          <FaTimes />
          Reject
        </button>
      ),
    },
    {
      onClick: handleWithdrawPayment,
      render: (contract) => (
        <button
          className={`flex items-center gap-1 rounded px-3 py-1 ${
            contract.paymentStatus !== 'paid' || contract.status !== 'completed'
              ? 'cursor-not-allowed bg-gray-400 text-white'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          disabled={
            contract.paymentStatus !== 'paid' || contract.status !== 'completed'
          }
        >
          <FaMoneyBillWave />
          Withdraw Payment
        </button>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>Manage Contracts [Interviewer] - OptaHire</title>
        <meta
          name="description"
          content="OptaHire Interviewer Contracts - View and manage all your recruitment contracts, accept/reject offers, and withdraw payments."
        />
        <meta
          name="keywords"
          content="contracts, payment withdrawal, accept contracts, reject contracts, interviewer dashboard"
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
              View and manage all your recruitment contracts, accept or reject
              offers, and withdraw your payments.
            </p>

            {error ||
              (updateError && (
                <Alert
                  message={error.data?.message || updateError.data?.message}
                />
              ))}
            {isSuccess && (
              <Alert
                message={updatedContract.data?.message}
                isSuccess={isSuccess}
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
