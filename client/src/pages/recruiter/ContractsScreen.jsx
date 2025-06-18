import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaBriefcase,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaCreditCard,
  FaDollarSign,
  FaExclamationTriangle,
  FaFileContract,
  FaHistory,
  FaInfoCircle,
  FaMoneyBillWave,
  FaPercent,
  FaTimes,
  FaUser,
} from 'react-icons/fa';
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
  useGetContractPayoutStatusQuery,
} from '../../features/payment/paymentApi';

export default function ContractsScreen() {
  const [selectedContract, setSelectedContract] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPayoutInfoModal, setShowPayoutInfoModal] = useState(false);
  const [payoutInfoContract, setPayoutInfoContract] = useState(null);

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

  // Query payout status for the selected contract when viewing details
  const { data: payoutStatusData, isLoading: isLoadingPayoutStatus } =
    useGetContractPayoutStatusQuery(payoutInfoContract?.id, {
      skip: !payoutInfoContract || !showPayoutInfoModal,
    });

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  // Handle contract completion (updated logic - now schedules automatic payout)
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

  // Handle view payout information
  const handleViewPayoutInfo = (contract) => {
    setPayoutInfoContract(contract);
    setShowPayoutInfoModal(true);
  };

  // Close status modal
  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
    setSelectedContract(null);
  };

  // Helper function to check if contract has scheduled payout
  const hasScheduledPayout = (contract) => {
    return contract.status === 'completed' && contract.paymentStatus === 'paid';
  };

  // Helper function to get contract status message
  const getContractStatusMessage = (contract) => {
    if (contract.status === 'completed' && contract.paymentStatus === 'paid') {
      return 'Auto-Payout Scheduled';
    }
    if (contract.status === 'active' && contract.paymentStatus === 'paid') {
      return 'Payment Received - Awaiting Completion';
    }
    if (contract.status === 'pending') {
      return 'Awaiting Payment';
    }
    return '';
  };

  const columns = [
    {
      key: 'jobTitle',
      label: 'Job Title',
      render: (contract) => contract.job.title,
    },
    {
      key: 'interviewer',
      label: 'Interviewer',
      render: (contract) =>
        `${contract.interviewer.firstName} ${contract.interviewer.lastName}`,
    },
    {
      key: 'paymentReady',
      label: 'Payment Ready',
      render: (contract) =>
        contract.interviewer?.payoutEnabled ? (
          <span className="rounded bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            Ready
          </span>
        ) : (
          <span className="rounded bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
            Setup Required
          </span>
        ),
    },
    {
      key: 'contractValue',
      label: 'Contract Value',
      render: (contract) => `$${contract.agreedPrice}`,
    },
    {
      key: 'platformFee',
      label: 'Platform Fee',
      render: (contract) => `$${(contract.agreedPrice * 0.025).toFixed(2)}`,
    },
    {
      key: 'interviewerGets',
      label: 'Interviewer Gets',
      render: (contract) => `$${(contract.agreedPrice * 0.975).toFixed(2)}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (contract) => (
        <span
          className={`rounded px-2.5 py-0.5 text-xs font-medium ${
            contract.status === 'pending'
              ? 'bg-gray-100 text-gray-800'
              : contract.status === 'active'
                ? 'bg-blue-100 text-blue-800'
                : contract.status === 'completed'
                  ? 'bg-green-100 text-green-800'
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
      key: 'statusInfo',
      label: 'Status Info',
      render: (contract) => getContractStatusMessage(contract) || '-',
    },
    {
      key: 'payment',
      label: 'Payment',
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
      key: 'payoutStatus',
      label: 'Payout Status',
      render: (contract) => (
        <span
          className={`rounded px-2.5 py-0.5 text-xs font-medium ${
            hasScheduledPayout(contract)
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {hasScheduledPayout(contract) ? 'Auto-payout Scheduled' : 'No Payout'}
        </span>
      ),
    },
    {
      key: 'transactions',
      label: 'Latest Transaction',
      render: (contract) => {
        const latestTransaction = contract.transactions?.[0];
        return latestTransaction
          ? `$${latestTransaction.amount} (${new Date(latestTransaction.transactionDate).toLocaleDateString()})`
          : '-';
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
              ? 'cursor-not-allowed bg-gray-500 text-white'
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
              : contract.paymentStatus === 'paid'
                ? 'Contract already paid'
                : ''
          }
        >
          <FaCreditCard />
          Pay Contract
        </button>
      ),
    },
    {
      onClick: handleCompleteContract,
      render: (contract) => {
        const canComplete =
          contract.status === 'active' &&
          contract.paymentStatus === 'paid' &&
          !hasScheduledPayout(contract);

        return (
          <button
            className={`flex items-center gap-1 rounded px-3 py-1 ${
              !canComplete
                ? 'cursor-not-allowed bg-gray-500 text-white'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
            disabled={!canComplete}
            title={
              hasScheduledPayout(contract)
                ? 'Contract already marked as completed'
                : contract.status !== 'active'
                  ? 'Contract must be active'
                  : contract.paymentStatus !== 'paid'
                    ? 'Payment must be completed first'
                    : 'Mark as completed and schedule automatic payout'
            }
          >
            <FaCheckCircle />
            {hasScheduledPayout(contract) ? 'Completed' : 'Mark Complete'}
          </button>
        );
      },
    },
    {
      onClick: handleViewPayoutInfo,
      render: () => (
        <button className="flex items-center gap-1 rounded bg-indigo-500 px-3 py-1 text-white hover:bg-indigo-600">
          <FaFileContract />
          Details
        </button>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>My Contracts - OptaHire | Manage Interview Services</title>
        <meta
          name="description"
          content="Manage interview service contracts on OptaHire. Track payments, interview progress, and build relationships with top interviewers."
        />
        <meta
          name="keywords"
          content="OptaHire Recruiter Contracts, Interview Services, Contract Management, Interview Payments, Professional Services"
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
              My{' '}
              <span className="text-light-primary dark:text-dark-primary">
                Contracts
              </span>
            </h1>
            <p className="mb-8 text-center text-lg text-light-text/70 dark:text-dark-text/70">
              Manage your interview service contracts and build lasting
              relationships with professional interviewers.
            </p>

            {/* Alerts */}
            {(error || completeError) && (
              <div className="mb-6 overflow-hidden rounded-xl bg-light-surface shadow-md dark:bg-dark-surface">
                <div className="border-b border-light-border px-6 py-4 dark:border-dark-border">
                  <div className="flex items-center gap-3">
                    <FaExclamationTriangle className="text-light-primary dark:text-dark-primary" />
                    <h2 className="text-xl font-semibold text-light-text dark:text-dark-text">
                      Error
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                  <Alert
                    message={
                      error?.data?.message || completeError?.data?.message
                    }
                  />
                </div>
              </div>
            )}

            {isCompleteSuccess && (
              <div className="mb-6 overflow-hidden rounded-xl bg-light-surface shadow-md dark:bg-dark-surface">
                <div className="border-b border-light-border px-6 py-4 dark:border-dark-border">
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-light-primary dark:text-dark-primary" />
                    <h2 className="text-xl font-semibold text-light-text dark:text-dark-text">
                      Success
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                  <Alert isSuccess={true} message={completeData?.message} />
                  {completeData?.data?.automatedPayout && (
                    <div className="mt-4 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                      <div className="flex items-center gap-2 text-green-800 dark:text-green-400">
                        <FaCalendarAlt />
                        <span className="font-medium">
                          Automatic Payout Scheduled
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                        Payment of ${completeData.data.payoutAmount} will be
                        transferred on{' '}
                        {new Date(
                          completeData.data.payoutScheduledFor
                        ).toLocaleDateString()}
                        . The interviewer has been notified.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Table
              columns={columns}
              data={contractsData?.contracts || []}
              actions={actions}
            />
          </div>
        )}

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

        {/* Payout Information Modal - Enhanced */}
        <Modal
          isOpen={showPayoutInfoModal}
          onClose={() => setShowPayoutInfoModal(false)}
          title="Contract & Payout Details"
        >
          {payoutInfoContract && (
            <div className="space-y-4 text-left">
              {isLoadingPayoutStatus ? (
                <div className="flex items-center justify-center p-8">
                  <Loader />
                </div>
              ) : (
                <>
                  {/* Job Title */}
                  <div className="break-words border-b border-light-border pb-4 dark:border-dark-border">
                    <div className="flex items-start">
                      <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                        <FaBriefcase
                          className="text-light-primary dark:text-dark-primary"
                          size={20}
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Job Title
                        </p>
                        <p className="text-lg font-medium text-light-text dark:text-dark-text">
                          {payoutInfoContract.job?.title || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Interviewer Information */}
                  <div className="break-words border-b border-light-border pb-4 dark:border-dark-border">
                    <div className="flex items-start">
                      <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                        <FaUser
                          className="text-light-primary dark:text-dark-primary"
                          size={20}
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Interviewer
                        </p>
                        <p className="text-lg font-medium text-light-text dark:text-dark-text">
                          {payoutInfoContract.interviewer?.firstName}{' '}
                          {payoutInfoContract.interviewer?.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {payoutInfoContract.interviewer?.email}
                        </p>
                        <div className="mt-1">
                          {payoutInfoContract.interviewer?.payoutEnabled ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                              <FaCheckCircle className="text-xs" />
                              Payment Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                              <FaExclamationTriangle className="text-xs" />
                              Setup Required
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contract Value */}
                  <div className="border-b border-light-border pb-4 dark:border-dark-border">
                    <div className="flex items-start">
                      <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                        <FaDollarSign
                          className="text-light-primary dark:text-dark-primary"
                          size={20}
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Contract Value
                        </p>
                        <p className="text-lg font-medium text-light-text dark:text-dark-text">
                          ${payoutInfoContract.agreedPrice}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Platform Fee */}
                  <div className="border-b border-light-border pb-4 dark:border-dark-border">
                    <div className="flex items-start">
                      <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                        <FaPercent
                          className="text-light-primary dark:text-dark-primary"
                          size={20}
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Platform Fee (2.5%)
                        </p>
                        <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
                          ${(payoutInfoContract.agreedPrice * 0.025).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Interviewer Earnings */}
                  <div className="border-b border-light-border pb-4 dark:border-dark-border">
                    <div className="flex items-start">
                      <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                        <FaMoneyBillWave
                          className="text-light-primary dark:text-dark-primary"
                          size={20}
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Interviewer Receives
                        </p>
                        <p className="text-lg font-medium text-green-600 dark:text-green-400">
                          ${(payoutInfoContract.agreedPrice * 0.975).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contract Status */}
                  <div className="border-b border-light-border pb-4 dark:border-dark-border">
                    <div className="flex items-start">
                      <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                        <FaInfoCircle
                          className="text-light-primary dark:text-dark-primary"
                          size={20}
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Contract Status
                        </p>
                        <span
                          className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                            payoutInfoContract.status === 'pending'
                              ? 'bg-gray-100 text-gray-800'
                              : payoutInfoContract.status === 'active'
                                ? 'bg-blue-100 text-blue-800'
                                : payoutInfoContract.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {payoutInfoContract.status.charAt(0).toUpperCase() +
                            payoutInfoContract.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Status */}
                  <div className="border-b border-light-border pb-4 dark:border-dark-border">
                    <div className="flex items-start">
                      <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                        <FaCheckCircle
                          className="text-light-primary dark:text-dark-primary"
                          size={20}
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Payment Status
                        </p>
                        <span
                          className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                            payoutInfoContract.paymentStatus === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : payoutInfoContract.paymentStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : payoutInfoContract.paymentStatus === 'failed'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {payoutInfoContract.paymentStatus
                            .charAt(0)
                            .toUpperCase() +
                            payoutInfoContract.paymentStatus.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payout Status */}
                  {payoutStatusData?.data && (
                    <div className="border-b border-light-border pb-4 dark:border-dark-border">
                      <div className="flex items-start">
                        <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                          <FaClock
                            className="text-light-primary dark:text-dark-primary"
                            size={20}
                          />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Payout Status
                          </p>
                          {payoutStatusData.data.hasScheduledPayout ? (
                            <div className="space-y-1">
                              <p className="text-lg font-medium text-green-600 dark:text-green-400">
                                Automatic Payout Scheduled
                              </p>
                              <p className="text-sm text-light-text/70 dark:text-dark-text/70">
                                Date:{' '}
                                {new Date(
                                  payoutStatusData.data.scheduledPayoutDate
                                ).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-light-text/70 dark:text-dark-text/70">
                                Amount: ${payoutStatusData.data.scheduledAmount}
                              </p>
                            </div>
                          ) : payoutInfoContract.status === 'active' &&
                            payoutInfoContract.paymentStatus === 'paid' ? (
                            <div className="space-y-1">
                              <p className="text-lg font-medium text-yellow-600 dark:text-yellow-400">
                                Ready for Completion
                              </p>
                              <p className="text-sm text-light-text/70 dark:text-dark-text/70">
                                Mark as completed to schedule automatic payout
                              </p>
                            </div>
                          ) : (
                            <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
                              No Scheduled Payout
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Transaction History */}
                  {payoutInfoContract.transactions?.length > 0 && (
                    <div className="border-b border-light-border pb-4 dark:border-dark-border">
                      <div className="flex items-start">
                        <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                          <FaHistory
                            className="text-light-primary dark:text-dark-primary"
                            size={20}
                          />
                        </div>
                        <div className="w-full">
                          <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                            Transaction History
                          </p>
                          <div className="space-y-2">
                            {payoutInfoContract.transactions.map(
                              (transaction) => (
                                <div
                                  key={transaction.id}
                                  className="flex items-center justify-between rounded-lg bg-light-surface p-3 dark:bg-dark-surface"
                                >
                                  <div>
                                    <p className="text-sm font-medium text-light-text dark:text-dark-text">
                                      {transaction.transactionType === 'payment'
                                        ? 'Contract Payment'
                                        : transaction.transactionType ===
                                            'payout'
                                          ? 'Interviewer Payout'
                                          : transaction.transactionType}
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
                                            : transaction.status === 'pending'
                                              ? 'text-yellow-600'
                                              : 'text-gray-600'
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
                      </div>
                    </div>
                  )}

                  {/* Close Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      className="flex items-center gap-2 rounded bg-gray-200 px-4 py-2 text-gray-800 transition-all duration-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                      onClick={() => setShowPayoutInfoModal(false)}
                    >
                      <FaTimes />
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
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
                        $
                        {paymentStatusData.data.platformFee || 'Not calculated'}
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
      </section>
    </>
  );
}
