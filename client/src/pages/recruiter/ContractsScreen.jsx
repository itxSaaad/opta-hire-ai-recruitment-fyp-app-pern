import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaCheckCircle, FaCreditCard, FaEye } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import StripePaymentForm from '../../components/payments/StripePaymentForm';
import Table from '../../components/ui/dashboardLayout/Table';

import { trackEvent, trackPageView } from '../../utils/analytics';

import { useGetAllContractsQuery } from '../../features/contract/contractApi';
import {
  useCompleteContractAndPayoutMutation,
  useGetContractPaymentStatusQuery,
} from '../../features/payment/paymentApi';

export default function ContractsScreen() {
  const [selectedContract, setSelectedContract] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

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
    completeContract,
    {
      isLoading: isCompleting,
      isSuccess: isCompleteSuccess,
      error: completeError,
      data: completeData,
    },
  ] = useCompleteContractAndPayoutMutation();

  const {
    data: paymentStatusData,
    isLoading: isLoadingPaymentStatus,
    error: paymentStatusError,
  } = useGetContractPaymentStatusQuery(selectedContract?.id, {
    skip: !selectedContract || !showStatusModal,
  });

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  // Handle contract completion
  const handleCompleteContract = async (contract) => {
    try {
      await completeContract(contract.id).unwrap();

      trackEvent(
        'Contract Completed',
        'Contract Action',
        `Completed contract for ${contract.job.title}`
      );

      // Refetch data to show updated status
      refetch();
    } catch (error) {
      console.error('Failed to complete contract:', error);
    }
  };

  // Handle payment modal
  const handlePayContract = (contract) => {
    // Check if interviewer has Stripe Connect set up
    if (
      !contract.interviewer?.stripeAccountId ||
      !contract.interviewer?.payoutEnabled
    ) {
      alert(
        'The interviewer has not completed their Stripe Connect setup yet. Please ask them to set up their payment account first.'
      );
      return;
    }

    setSelectedContract(contract);
    setShowPaymentModal(true);

    trackEvent(
      'Payment Modal Opened',
      'Contract Action',
      `Opened payment for contract ${contract.job.title}`
    );
  };

  // Handle payment success
  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedContract(null);
    refetch(); // Refresh contracts to show updated status

    trackEvent(
      'Payment Completed',
      'Contract Action',
      `Payment completed for contract ${selectedContract?.job?.title}`
    );
  };

  // Handle payment modal close
  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setSelectedContract(null);
  };

  // Handle view payment status
  const handleViewPaymentStatus = (contract) => {
    setSelectedContract(contract);
    setShowStatusModal(true);
  };

  // Close status modal
  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
    setSelectedContract(null);
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
        <div>
          <span className="text-light-text/70 dark:text-dark-text/70">
            {`${contract.interviewer.firstName} ${contract.interviewer.lastName}`}
          </span>
        </div>
      ),
    },
    {
      key: 'payoutEnabled',
      label: 'Payout Enabled',
      render: (contract) => (
        <span
          className={`rounded px-2.5 py-0.5 text-xs font-medium ${
            contract.interviewer?.payoutEnabled
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {contract.interviewer?.payoutEnabled ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'agreedPrice',
      label: 'Agreed Price',
      render: (contract) => (
        <div>
          <span className="text-light-text/70 dark:text-dark-text/70">
            ${contract.agreedPrice}
          </span>
          <div className="text-xs text-gray-500">
            Net: ${(contract.agreedPrice * 0.975).toFixed(2)}
          </div>
        </div>
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
      onClick: handlePayContract,
      render: (contract) => (
        <button
          className={`flex items-center gap-1 rounded px-3 py-1 ${
            contract.paymentStatus === 'paid' ||
            contract.status === 'cancelled' ||
            !contract.interviewer?.payoutEnabled
              ? 'cursor-not-allowed bg-gray-400 text-white'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          disabled={
            contract.paymentStatus === 'paid' ||
            contract.status === 'cancelled' ||
            !contract.interviewer?.payoutEnabled
          }
          title={
            !contract.interviewer?.payoutEnabled
              ? 'Interviewer needs to complete Stripe Connect setup'
              : ''
          }
        >
          <FaCreditCard />
          Pay for Contract
        </button>
      ),
    },
    {
      onClick: handleCompleteContract,
      render: (contract) => (
        <button
          className={`flex items-center gap-1 rounded px-3 py-1 ${
            contract.status !== 'active' || contract.paymentStatus !== 'paid'
              ? 'cursor-not-allowed bg-gray-400 text-white'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
          disabled={
            contract.status !== 'active' || contract.paymentStatus !== 'paid'
          }
        >
          <FaCheckCircle />
          Mark as Completed
        </button>
      ),
    },
    {
      onClick: handleViewPaymentStatus,
      render: () => (
        <button className="flex items-center gap-1 rounded bg-gray-500 px-3 py-1 text-white hover:bg-gray-600">
          <FaEye />
          View Details
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
        {isLoading || isCompleting ? (
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

            {(error || completeError) && (
              <Alert
                message={error?.data?.message || completeError?.data?.message}
              />
            )}

            {isCompleteSuccess && (
              <Alert isSuccess={true} message={completeData?.message} />
            )}

            <Table
              columns={columns}
              data={contractsData?.contracts || []}
              actions={actions}
            />
          </div>
        )}
      </section>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={handlePaymentCancel}
        title="Pay for Contract"
      >
        {selectedContract && (
          <StripePaymentForm
            contract={selectedContract}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        )}
      </Modal>

      {/* Payment Status Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={handleCloseStatusModal}
        title="Contract Payment Details"
      >
        {selectedContract && (
          <div className="max-w-2xl">
            {isLoadingPaymentStatus ? (
              <div className="flex items-center justify-center p-8">
                <Loader />
              </div>
            ) : paymentStatusError ? (
              <Alert
                message={
                  paymentStatusError.data?.message ||
                  'Failed to load payment status'
                }
              />
            ) : paymentStatusData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text">
                      Job Title
                    </label>
                    <p className="mt-1 text-sm text-light-text dark:text-dark-text">
                      {selectedContract.job?.title}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text">
                      Agreed Price
                    </label>
                    <p className="mt-1 text-sm text-light-text dark:text-dark-text">
                      ${paymentStatusData.data.agreedPrice}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text">
                      Platform Fee
                    </label>
                    <p className="mt-1 text-sm text-light-text dark:text-dark-text">
                      ${paymentStatusData.data.platformFee || 'Not calculated'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text">
                      Contract Status
                    </label>
                    <p className="mt-1 text-sm text-light-text dark:text-dark-text">
                      {paymentStatusData.data.contractStatus}
                    </p>
                  </div>
                </div>

                {paymentStatusData.data.transactions?.length > 0 && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-light-text dark:text-dark-text">
                      Transaction History
                    </label>
                    <div className="space-y-2">
                      {paymentStatusData.data.transactions.map(
                        (transaction) => (
                          <div
                            key={transaction.id}
                            className="flex items-center justify-between rounded-lg bg-light-surface p-3 dark:bg-dark-surface"
                          >
                            <div>
                              <p className="text-sm font-medium text-light-text dark:text-dark-text">
                                {transaction.transactionType}
                              </p>
                              <p className="text-xs text-light-text/70 dark:text-dark-text/70">
                                {new Date(
                                  transaction.transactionDate
                                ).toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-light-text dark:text-dark-text">
                                ${transaction.amount}
                              </p>
                              <p
                                className={`text-xs ${
                                  transaction.status === 'completed'
                                    ? 'text-green-600'
                                    : transaction.status === 'failed'
                                      ? 'text-red-600'
                                      : 'text-yellow-600'
                                }`}
                              >
                                {transaction.status}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </Modal>
    </>
  );
}
