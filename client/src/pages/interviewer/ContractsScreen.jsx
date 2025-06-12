import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaBriefcase,
  FaBuilding,
  FaCalendarAlt,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaCog,
  FaDollarSign,
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaFileContract,
  FaHistory,
  FaInfoCircle,
  FaMoneyBillWave,
  FaPercent,
  FaTimes,
  FaUser,
  FaWallet,
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import StripeConnectSetup from '../../components/payments/StripeConnectSetup';
import Table from '../../components/ui/dashboardLayout/Table';

import { trackEvent, trackPageView } from '../../utils/analytics';

import {
  useGetAllContractsQuery,
  useUpdateContractByIdMutation,
} from '../../features/contract/contractApi';
import {
  useCompleteContractAndPayoutMutation,
  useGetContractPayoutStatusQuery,
  useGetPayoutHistoryQuery,
  useGetStripeConnectStatusQuery,
} from '../../features/payment/paymentApi';

export default function ContractsScreen() {
  const location = useLocation();
  const interviewerId = useSelector((state) => state.auth.userInfo.id);

  const [showStripeModal, setShowStripeModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [stripeReturnAlert, setStripeReturnAlert] = useState(null);
  const [showPayoutInfoModal, setShowPayoutInfoModal] = useState(false);
  const [payoutInfoContract, setPayoutInfoContract] = useState(null);

  const {
    data: contractsData,
    isLoading,
    error,
    refetch,
  } = useGetAllContractsQuery({
    interviewerId,
  });

  const {
    data: stripeStatus,
    isLoading: isLoadingStripe,
    error: stripeError,
    refetch: refetchStripeStatus,
  } = useGetStripeConnectStatusQuery();

  const {
    data: payoutData,
    isLoading: isLoadingPayouts,
    error: payoutError,
  } = useGetPayoutHistoryQuery(undefined, {
    skip: !showPayoutModal,
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

  const [
    completeContract,
    {
      isLoading: isCompleting,
      isSuccess: isCompleteSuccess,
      error: completeError,
    },
  ] = useCompleteContractAndPayoutMutation();

  // Query payout status for the selected contract when viewing details
  const { data: payoutStatusData, isLoading: isLoadingPayoutStatus } =
    useGetContractPayoutStatusQuery(payoutInfoContract?.id, {
      skip: !payoutInfoContract || !showPayoutInfoModal,
    });

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  // Handle state passed from Stripe return pages
  useEffect(() => {
    if (location.state?.openStripeModal) {
      setShowStripeModal(true);
      window.history.replaceState({}, document.title);
    }

    if (location.state?.stripeError) {
      setStripeReturnAlert({
        type: 'error',
        message: location.state.stripeError,
      });
      window.history.replaceState({}, document.title);
    }

    if (location.state?.stripeSuccess) {
      setStripeReturnAlert({
        type: 'success',
        message: location.state.stripeSuccess,
      });
      refetchStripeStatus();
      window.history.replaceState({}, document.title);
    }
  }, [location.state, refetchStripeStatus]);

  // Auto-dismiss alerts after 5 seconds
  useEffect(() => {
    if (stripeReturnAlert) {
      const timer = setTimeout(() => {
        setStripeReturnAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [stripeReturnAlert]);

  // Handle contract acceptance
  const handleAcceptContract = async (contract) => {
    if (!stripeStatus?.data?.payoutEnabled) {
      alert(
        'Please complete your Stripe Connect setup before accepting contracts.'
      );
      setShowStripeModal(true);
      return;
    }

    try {
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
    } catch (err) {
      console.error('Contract acceptance failed:', err);
    }
  };

  // Handle contract rejection
  const handleRejectContract = async (contract) => {
    try {
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
    } catch (err) {
      console.error('Contract rejection failed:', err);
    }
  };

  // Handle contract completion (updated logic)
  const handleCompleteContract = async (contract) => {
    try {
      await completeContract(contract.id).unwrap();

      trackEvent(
        'Contract Completed',
        'Contract Action',
        `Completed contract for ${contract.job.title}`
      );

      refetch();
    } catch (err) {
      console.error('Contract completion failed:', err);
    }
  };

  // Handle view payout information
  const handleViewPayoutInfo = (contract) => {
    setPayoutInfoContract(contract);
    setShowPayoutInfoModal(true);
  };

  // Handle showing earnings
  const handleViewEarnings = () => {
    setShowPayoutModal(true);
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

  const hasStripeAccount = stripeStatus?.data?.hasAccount;
  const payoutEnabled = stripeStatus?.data?.payoutEnabled;

  const columns = [
    {
      key: 'jobTitle',
      label: 'Job Title',
      render: (contract) => contract.job.title,
    },
    {
      key: 'recruiter',
      label: 'Recruiter',
      render: (contract) =>
        `${contract.recruiter.firstName} ${contract.recruiter.lastName}`,
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
      key: 'yourEarnings',
      label: 'Your Earnings',
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
                ? 'bg-gray-100 text-gray-800'
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
      onClick: handleAcceptContract,
      render: (contract) => (
        <button
          className={`flex items-center gap-1 rounded px-3 py-1 ${
            contract.status !== 'pending'
              ? 'cursor-not-allowed bg-gray-500 text-white'
              : !payoutEnabled
                ? 'cursor-not-allowed bg-orange-500 text-white'
                : 'bg-green-500 text-white hover:bg-green-600'
          }`}
          disabled={contract.status !== 'pending' || !payoutEnabled}
          title={!payoutEnabled ? 'Complete Stripe Connect setup first' : ''}
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
              ? 'cursor-not-allowed bg-gray-500 text-white'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
          disabled={contract.status !== 'pending'}
        >
          <FaTimes />
          Reject
        </button>
      ),
    },
    {
      onClick: handleCompleteContract,
      render: (contract) => {
        const isScheduledPayout = hasScheduledPayout(contract);
        const canComplete =
          contract.status === 'completed' &&
          contract.paymentStatus === 'paid' &&
          !isScheduledPayout;

        return (
          <button
            className={`flex items-center gap-1 rounded px-3 py-1 ${
              !canComplete
                ? 'cursor-not-allowed bg-gray-500 text-white'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            disabled={!canComplete}
            title={
              isScheduledPayout
                ? 'Payout is scheduled automatically by recruiter'
                : contract.status !== 'completed'
                  ? 'Contract must be completed first'
                  : contract.paymentStatus !== 'paid'
                    ? 'Payment must be received before completing'
                    : ''
            }
          >
            <FaCheckCircle />
            {hasScheduledPayout(contract) ? 'Completed' : 'Complete'}
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
        <title>Manage Contracts [Interviewer] - OptaHire</title>
        <meta
          name="description"
          content="OptaHire Interviewer Contracts - View and manage all your recruitment contracts, accept/reject offers, and track your earnings."
        />
        <meta
          name="keywords"
          content="contracts, earnings, accept contracts, reject contracts, interviewer dashboard"
        />
      </Helmet>

      <section className="flex min-h-screen animate-fadeIn flex-col items-center bg-light-background px-4 py-24 dark:bg-dark-background">
        {isLoading || isUpdating || isCompleting ? (
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
              offers, and track your earnings.
            </p>
            {/* Stripe Return Alert */}
            {stripeReturnAlert && (
              <div className="mb-6">
                <Alert
                  message={stripeReturnAlert.message}
                  isSuccess={stripeReturnAlert.type === 'success'}
                />
              </div>
            )}
            {/*  Stripe Connect Status Banner  */}
            {!isLoadingStripe && (
              <div className="mb-8 overflow-hidden rounded-xl bg-light-surface shadow-md dark:bg-dark-surface">
                <div className="border-b border-light-border px-6 py-4 dark:border-dark-border">
                  <div className="flex items-center gap-3">
                    {!hasStripeAccount ? (
                      <FaExclamationTriangle className="text-light-primary dark:text-dark-primary" />
                    ) : !payoutEnabled ? (
                      <FaExclamationTriangle className="text-light-primary dark:text-dark-primary" />
                    ) : (
                      <FaCheckCircle className="text-light-primary dark:text-dark-primary" />
                    )}
                    <h2 className="text-xl font-semibold text-light-text dark:text-dark-text">
                      {!hasStripeAccount
                        ? 'Payment Setup'
                        : !payoutEnabled
                          ? 'Complete Setup'
                          : 'Payment Status'}
                    </h2>
                  </div>
                </div>

                <div className="p-6">
                  {!hasStripeAccount ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="mb-2 font-medium text-light-text dark:text-dark-text">
                          Payment Setup Required
                        </p>
                        <p className="text-sm text-light-text/70 dark:text-dark-text/70">
                          Set up your Stripe Connect account to receive payments
                          and accept contracts.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowStripeModal(true)}
                        className="flex items-center gap-2 rounded-lg bg-light-primary px-4 py-2 text-white transition-colors hover:bg-light-primary/90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-dark-primary dark:hover:bg-dark-primary/90"
                      >
                        <FaCog />
                        Setup Now
                      </button>
                    </div>
                  ) : !payoutEnabled ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="mb-2 font-medium text-light-text dark:text-dark-text">
                          Complete Your Setup
                        </p>
                        <p className="text-sm text-light-text/70 dark:text-dark-text/70">
                          Finish your Stripe Connect verification to start
                          accepting contracts.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowStripeModal(true)}
                        className="flex items-center gap-2 rounded-lg bg-light-primary px-4 py-2 text-white transition-colors hover:bg-light-primary/90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-dark-primary dark:hover:bg-dark-primary/90"
                      >
                        <FaExternalLinkAlt />
                        Complete Setup
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="mb-2 font-medium text-light-text dark:text-dark-text">
                          Payment Setup Complete
                        </p>
                        <p className="text-sm text-light-text/70 dark:text-dark-text/70">
                          You&apos;re all set to receive payments! Earnings are
                          automatically transferred to your Stripe account.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleViewEarnings}
                          className="flex items-center gap-2 rounded-lg bg-light-primary px-4 py-2 text-white transition-colors hover:bg-light-primary/90 dark:bg-dark-primary dark:hover:bg-dark-primary/90"
                        >
                          <FaWallet />
                          View Earnings
                        </button>
                        <button
                          onClick={() => setShowStripeModal(true)}
                          className="flex items-center gap-2 rounded-lg bg-light-secondary px-4 py-2 text-white transition-colors hover:bg-light-secondary/90 dark:bg-dark-secondary dark:hover:bg-dark-secondary/90"
                        >
                          <FaCog />
                          Manage
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Alerts */}
            {(error || updateError || completeError || stripeError) && (
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
                      error?.data?.message ||
                      updateError?.data?.message ||
                      completeError?.data?.message ||
                      stripeError?.data?.message
                    }
                  />
                </div>
              </div>
            )}
            {(isSuccess || isCompleteSuccess) && (
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
                  <Alert
                    message={
                      updatedContract?.message ||
                      'Contract updated successfully'
                    }
                    isSuccess={true}
                  />
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
      </section>

      {/* Stripe Connect Setup Modal */}
      <Modal
        isOpen={showStripeModal}
        onClose={() => setShowStripeModal(false)}
        title="Payment Setup"
      >
        {isLoadingStripe ? (
          <div className="flex items-center justify-center p-8">
            <Loader />
          </div>
        ) : (
          <StripeConnectSetup onClose={() => setShowStripeModal(false)} />
        )}
      </Modal>

      {/* Payout Information Modal - Redesigned */}
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

                {/* Recruiter Information */}
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
                        Recruiter
                      </p>
                      <p className="text-lg font-medium text-light-text dark:text-dark-text">
                        {payoutInfoContract.recruiter?.firstName}{' '}
                        {payoutInfoContract.recruiter?.lastName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {payoutInfoContract.recruiter?.email}
                      </p>
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
                      <p className="text-lg font-medium text-light-text dark:text-dark-text">
                        ${(payoutInfoContract.agreedPrice * 0.025).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Your Earnings */}
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
                        Your Earnings
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
                        ) : (
                          <p className="text-lg font-medium text-yellow-600 dark:text-yellow-400">
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

      {/* Payout History Modal - Redesigned */}
      <Modal
        isOpen={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        title="Earnings History"
      >
        <div className="space-y-4 text-left">
          {isLoadingPayouts ? (
            <div className="flex items-center justify-center p-8">
              <Loader />
            </div>
          ) : payoutError ? (
            <Alert
              message={payoutError.data?.message || 'Failed to load earnings'}
            />
          ) : payoutData ? (
            <>
              {/* Total Earnings Summary */}
              <div className="break-words border-b border-light-border pb-4 dark:border-dark-border">
                <div className="flex items-start">
                  <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                    <FaChartLine
                      className="text-light-primary dark:text-dark-primary"
                      size={20}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Earnings
                    </p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      ${payoutData.data.totalEarnings.toFixed(2)}
                    </p>
                    <p className="text-sm text-light-text/70 dark:text-dark-text/70">
                      From {payoutData.data.payouts.length} completed contracts
                    </p>
                  </div>
                </div>
              </div>

              {/* Payout History */}
              {payoutData.data.payouts.length > 0 ? (
                <div className="border-b border-light-border pb-4 dark:border-dark-border">
                  <div className="flex items-start">
                    <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                      <FaWallet
                        className="text-light-primary dark:text-dark-primary"
                        size={20}
                      />
                    </div>
                    <div className="w-full">
                      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                        Recent Payouts
                      </p>
                      <div className="space-y-3">
                        {payoutData.data.payouts.map((payout) => (
                          <div
                            key={payout.id}
                            className="rounded-lg bg-light-surface p-4 dark:bg-dark-surface"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start">
                                <div className="mr-3 mt-1 flex w-5 min-w-[20px] justify-center">
                                  <FaBriefcase
                                    className="text-light-primary dark:text-dark-primary"
                                    size={16}
                                  />
                                </div>
                                <div>
                                  <p className="font-medium text-light-text dark:text-dark-text">
                                    {payout.contract.job.title}
                                  </p>
                                  <div className="flex items-center gap-2 text-sm text-light-text/70 dark:text-dark-text/70">
                                    <FaBuilding size={12} />
                                    {payout.contract.job.company}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-light-text/70 dark:text-dark-text/70">
                                    <FaUser size={12} />
                                    {payout.contract.recruiter.firstName}{' '}
                                    {payout.contract.recruiter.lastName}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-light-text/60 dark:text-dark-text/60">
                                    <FaCalendarAlt size={10} />
                                    {new Date(
                                      payout.transactionDate
                                    ).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-green-600 dark:text-green-400">
                                  +${payout.netAmount}
                                </p>
                                <p className="text-xs text-light-text/60 dark:text-dark-text/60">
                                  Fee: ${payout.platformFee}
                                </p>
                                <span
                                  className={`mt-1 inline-block rounded-full px-2 py-1 text-xs ${
                                    payout.status === 'completed'
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                  }`}
                                >
                                  {payout.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-b border-light-border pb-4 dark:border-dark-border">
                  <div className="flex items-start">
                    <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
                      <FaWallet
                        className="text-light-primary dark:text-dark-primary"
                        size={20}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-medium text-light-text dark:text-dark-text">
                        No earnings yet
                      </p>
                      <p className="text-sm text-light-text/60 dark:text-dark-text/60">
                        Complete contracts to start earning money!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end pt-2">
                <button
                  className="flex items-center gap-2 rounded bg-gray-200 px-4 py-2 text-gray-800 transition-all duration-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  onClick={() => setShowPayoutModal(false)}
                >
                  <FaTimes />
                  Close
                </button>
              </div>
            </>
          ) : null}
        </div>
      </Modal>
    </>
  );
}
