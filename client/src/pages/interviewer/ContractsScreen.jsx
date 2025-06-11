import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaCheckCircle,
  FaCog,
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaEye,
  FaTimes,
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
  useGetPayoutHistoryQuery,
  useGetStripeConnectStatusQuery,
} from '../../features/payment/paymentApi';

export default function ContractsScreen() {
  const location = useLocation();
  const interviewerId = useSelector((state) => state.auth.userInfo.id);

  const [showStripeModal, setShowStripeModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [stripeReturnAlert, setStripeReturnAlert] = useState(null);

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

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  // Handle state passed from Stripe return pages
  useEffect(() => {
    if (location.state?.openStripeModal) {
      setShowStripeModal(true);
      // Clear the state by replacing the current location
      window.history.replaceState({}, document.title);
    }

    if (location.state?.stripeError) {
      setStripeReturnAlert({
        type: 'error',
        message: location.state.stripeError,
      });
      // Clear the state
      window.history.replaceState({}, document.title);
    }

    if (location.state?.stripeSuccess) {
      setStripeReturnAlert({
        type: 'success',
        message: location.state.stripeSuccess,
      });
      // Refetch Stripe status to get updated data
      refetchStripeStatus();
      // Clear the state
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
    // Check if Stripe Connect is set up
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

  // Handle contract completion
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

  // Handle view contract details
  const handleViewContract = (contract) => {
    setSelectedContract(contract);
  };

  // Handle showing earnings
  const handleViewEarnings = () => {
    setShowPayoutModal(true);
  };

  const hasStripeAccount = stripeStatus?.data?.hasAccount;
  const payoutEnabled = stripeStatus?.data?.payoutEnabled;

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
      label: 'Payment',
      render: (contract) => (
        <div>
          <span className="text-light-text/70 dark:text-dark-text/70">
            ${contract.agreedPrice}
          </span>
          <div className="text-xs text-green-600">
            You earn: ${(contract.agreedPrice * 0.975).toFixed(2)}
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
      onClick: handleAcceptContract,
      render: (contract) => (
        <button
          className={`flex items-center gap-1 rounded px-3 py-1 ${
            contract.status !== 'pending'
              ? 'cursor-not-allowed bg-gray-400 text-white'
              : !payoutEnabled
                ? 'cursor-not-allowed bg-orange-400 text-white'
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
      onClick: handleCompleteContract,
      render: (contract) => (
        <button
          className={`flex items-center gap-1 rounded px-3 py-1 ${
            contract.status !== 'active' || contract.paymentStatus !== 'paid'
              ? 'cursor-not-allowed bg-gray-400 text-white'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          disabled={
            contract.status !== 'active' || contract.paymentStatus !== 'paid'
          }
        >
          <FaCheckCircle />
          Complete
        </button>
      ),
    },
    {
      onClick: handleViewContract,
      render: () => (
        <button className="flex items-center gap-1 rounded bg-gray-500 px-3 py-1 text-white hover:bg-gray-600">
          <FaEye />
          View
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

            {/* Stripe Connect Status Banner */}
            {!isLoadingStripe && (
              <div className="mb-6 animate-slideUp">
                {!hasStripeAccount ? (
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FaExclamationTriangle className="text-xl text-yellow-600 dark:text-yellow-400" />
                        <div>
                          <h3 className="font-semibold text-yellow-800 dark:text-yellow-400">
                            Payment Setup Required
                          </h3>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Set up your Stripe Connect account to receive
                            payments and accept contracts.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowStripeModal(true)}
                        className="flex items-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-white transition-colors hover:bg-yellow-700 dark:bg-yellow-600 dark:hover:bg-yellow-700"
                      >
                        <FaCog />
                        Setup Now
                      </button>
                    </div>
                  </div>
                ) : !payoutEnabled ? (
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FaExclamationTriangle className="text-xl text-orange-600 dark:text-orange-400" />
                        <div>
                          <h3 className="font-semibold text-orange-800 dark:text-orange-400">
                            Complete Your Setup
                          </h3>
                          <p className="text-sm text-orange-700 dark:text-orange-300">
                            Finish your Stripe Connect verification to start
                            accepting contracts.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowStripeModal(true)}
                        className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700"
                      >
                        <FaExternalLinkAlt />
                        Complete Setup
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FaCheckCircle className="text-xl text-green-600 dark:text-green-400" />
                        <div>
                          <h3 className="font-semibold text-green-800 dark:text-green-400">
                            Payment Setup Complete
                          </h3>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            You're all set to receive payments! Earnings are
                            automatically transferred to your bank account.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleViewEarnings}
                          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                        >
                          <FaWallet />
                          View Earnings
                        </button>
                        <button
                          onClick={() => setShowStripeModal(true)}
                          className="flex items-center gap-2 rounded-lg border border-green-600 bg-light-background px-4 py-2 text-green-600 transition-colors hover:bg-green-50 dark:border-green-600 dark:bg-dark-background dark:text-green-400 dark:hover:bg-green-900/20"
                        >
                          <FaCog />
                          Manage
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(error || updateError || completeError || stripeError) && (
              <Alert
                message={
                  error?.data?.message ||
                  updateError?.data?.message ||
                  completeError?.data?.message ||
                  stripeError?.data?.message
                }
              />
            )}

            {(isSuccess || isCompleteSuccess) && (
              <Alert
                message={
                  updatedContract?.message || 'Contract updated successfully'
                }
                isSuccess={true}
              />
            )}

            <Table
              columns={columns}
              data={contractsData?.contracts || []}
              actions={actions}
            />
          </div>
        )}

        {/* Stripe Connect Setup Modal */}
        <Modal
          isOpen={showStripeModal}
          onClose={() => setShowStripeModal(false)}
          title="Payment Setup"
        >
          <StripeConnectSetup />
        </Modal>

        {/* Payout History Modal */}
        <Modal
          isOpen={showPayoutModal}
          onClose={() => setShowPayoutModal(false)}
          title="Earnings History"
        >
          <div className="max-w-4xl">
            {isLoadingPayouts ? (
              <div className="flex items-center justify-center p-8">
                <Loader />
              </div>
            ) : payoutError ? (
              <Alert
                message={payoutError.data?.message || 'Failed to load earnings'}
              />
            ) : payoutData ? (
              <div className="animate-fadeIn space-y-6">
                {/* Summary */}
                <div className="rounded-lg bg-gradient-to-r from-green-50 to-blue-50 p-6 dark:from-green-900/20 dark:to-blue-900/20">
                  <h4 className="mb-2 text-lg font-semibold text-light-text dark:text-dark-text">
                    Total Earnings
                  </h4>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    ${payoutData.data.totalEarnings.toFixed(2)}
                  </p>
                  <p className="mt-1 text-sm text-light-text/70 dark:text-dark-text/70">
                    From {payoutData.data.payouts.length} completed contracts
                  </p>
                </div>

                {/* Payout List */}
                {payoutData.data.payouts.length > 0 ? (
                  <div className="animate-slideUp space-y-3">
                    <h4 className="font-semibold text-light-text dark:text-dark-text">
                      Recent Payouts
                    </h4>
                    {payoutData.data.payouts.map((payout) => (
                      <div
                        key={payout.id}
                        className="flex items-center justify-between rounded-lg bg-light-surface p-4 dark:bg-dark-surface"
                      >
                        <div>
                          <p className="font-medium text-light-text dark:text-dark-text">
                            {payout.contract.job.title}
                          </p>
                          <p className="text-sm text-light-text/70 dark:text-dark-text/70">
                            {payout.contract.job.company} •{' '}
                            {payout.contract.recruiter.firstName}{' '}
                            {payout.contract.recruiter.lastName}
                          </p>
                          <p className="text-xs text-light-text/60 dark:text-dark-text/60">
                            {new Date(
                              payout.transactionDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            +${payout.netAmount}
                          </p>
                          <p className="text-xs text-light-text/60 dark:text-dark-text/60">
                            Fee: ${payout.platformFee}
                          </p>
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-xs ${
                              payout.status === 'completed'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            }`}
                          >
                            {payout.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="animate-fadeIn py-8 text-center">
                    <FaWallet className="mx-auto mb-4 text-4xl text-light-text/40 dark:text-dark-text/40" />
                    <p className="text-light-text/70 dark:text-dark-text/70">No earnings yet</p>
                    <p className="text-sm text-light-text/60 dark:text-dark-text/60">
                      Complete contracts to start earning money!
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </Modal>
      </section>
    </>
  );
}