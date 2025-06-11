import { useEffect, useState } from 'react';
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaLightbulb,
} from 'react-icons/fa';

import Alert from '../Alert';
import Loader from '../Loader';

import { trackEvent } from '../../utils/analytics';

import {
  useCreateStripeConnectAccountMutation,
  useGetStripeConnectDashboardQuery,
  useGetStripeConnectStatusQuery,
  useRefreshStripeConnectLinkMutation,
} from '../../features/payment/paymentApi';

export default function StripeConnectSetup() {
  const [showDashboard, setShowDashboard] = useState(false);

  const {
    data: connectStatus,
    isLoading: isLoadingStatus,
    error: statusError,
    refetch: refetchStatus,
  } = useGetStripeConnectStatusQuery();

  const [createAccount, { isLoading: isCreatingAccount, error: createError }] =
    useCreateStripeConnectAccountMutation();

  const [refreshLink, { isLoading: isRefreshingLink, error: refreshError }] =
    useRefreshStripeConnectLinkMutation();

  const {
    data: dashboardData,
    isLoading: isLoadingDashboard,
    error: dashboardError,
  } = useGetStripeConnectDashboardQuery(undefined, {
    skip: !showDashboard || !connectStatus?.data?.hasAccount,
  });

  // Auto-refresh status when page becomes visible (for returning from Stripe)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refetchStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refetchStatus]);

  const handleCreateAccount = async () => {
    try {
      trackEvent(
        'Stripe Connect',
        'Create Account Started',
        'User clicked create Stripe account'
      );

      const result = await createAccount().unwrap();

      trackEvent(
        'Stripe Connect',
        'Redirect to Stripe',
        'User redirected to Stripe onboarding'
      );

      // Redirect to Stripe onboarding
      window.location.href = result.data.onboardingUrl;
    } catch (error) {
      console.error('Failed to create Stripe account:', error);
      trackEvent(
        'Stripe Connect',
        'Create Account Failed',
        error.data?.message || 'Unknown error'
      );
    }
  };

  const handleRefreshLink = async () => {
    try {
      trackEvent(
        'Stripe Connect',
        'Refresh Link Started',
        'User clicked refresh setup link'
      );

      const result = await refreshLink().unwrap();

      trackEvent(
        'Stripe Connect',
        'Refresh Redirect',
        'User redirected to refreshed onboarding'
      );

      // Redirect to refreshed onboarding link
      window.location.href = result.data.onboardingUrl;
    } catch (error) {
      console.error('Failed to refresh onboarding link:', error);
      trackEvent(
        'Stripe Connect',
        'Refresh Link Failed',
        error.data?.message || 'Unknown error'
      );
    }
  };

  const handleOpenDashboard = async () => {
    setShowDashboard(true);
    trackEvent(
      'Stripe Connect',
      'Dashboard Requested',
      'User clicked open Stripe dashboard'
    );
    try {
      // Dashboard query will be triggered automatically
      // We'll redirect once we get the dashboard URL
    } catch (error) {
      console.error('Failed to get dashboard link:', error);
      trackEvent(
        'Stripe Connect',
        'Dashboard Failed',
        error.data?.message || 'Unknown error'
      );
    }
  };

  // Redirect to dashboard when URL is available
  useEffect(() => {
    if (dashboardData?.data?.dashboardUrl) {
      trackEvent(
        'Stripe Connect',
        'Dashboard Opened',
        'User redirected to Stripe dashboard'
      );
      window.open(dashboardData.data.dashboardUrl, '_blank');
      setShowDashboard(false);
    }
  }, [dashboardData]);

  if (isLoadingStatus) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader />
      </div>
    );
  }

  const hasAccount = connectStatus?.data?.hasAccount;
  const accountStatus = connectStatus?.data?.accountStatus;
  const payoutEnabled = connectStatus?.data?.payoutEnabled;

  return (
    <div className="mx-auto max-w-2xl animate-fadeIn">
      <div className="mb-6 text-center">
        <h2 className="mb-2 text-2xl font-bold text-light-text dark:text-dark-text">
          Payment Setup
        </h2>
        <p className="text-light-text/70 dark:text-dark-text/70">
          Set up your Stripe Connect account to receive payments from completed
          contracts
        </p>
      </div>

      {(statusError || createError || refreshError || dashboardError) && (
        <div className="mb-6">
          <Alert
            message={
              statusError?.data?.message ||
              createError?.data?.message ||
              refreshError?.data?.message ||
              dashboardError?.data?.message ||
              'An error occurred'
            }
          />
        </div>
      )}

      {!hasAccount ? (
        // No account - show setup option
        <div className="animate-slideUp text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-light-primary/10 dark:bg-dark-primary/10">
            <FaExternalLinkAlt className="h-8 w-8 text-light-primary dark:text-dark-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-light-text dark:text-dark-text">
            Connect Your Stripe Account
          </h3>
          <p className="mb-6 text-light-text/70 dark:text-dark-text/70">
            To receive payments, you need to set up a Stripe Connect account.
            This is secure and takes just a few minutes.
          </p>

          {isCreatingAccount ? (
            <div className="flex items-center justify-center p-4">
              <Loader />
            </div>
          ) : (
            <button
              onClick={handleCreateAccount}
              className="inline-flex items-center gap-2 rounded-lg bg-light-primary px-6 py-3 font-medium text-white transition-colors hover:opacity-90 dark:bg-dark-primary"
            >
              <FaExternalLinkAlt />
              Set Up Stripe Account
            </button>
          )}
        </div>
      ) : (
        // Has account - show status
        <div className="animate-slideUp space-y-6">
          <div className="flex items-center justify-between rounded-lg bg-light-surface p-4 dark:bg-dark-surface">
            <div className="flex items-center gap-3">
              {payoutEnabled ? (
                <FaCheckCircle className="text-xl text-green-600 dark:text-green-400" />
              ) : (
                <FaExclamationTriangle className="text-xl text-yellow-600 dark:text-yellow-400" />
              )}
              <div>
                <h3 className="font-semibold text-light-text dark:text-dark-text">
                  Stripe Connect Account
                </h3>
                <p className="text-sm text-light-text/70 dark:text-dark-text/70">
                  Status: <span className="capitalize">{accountStatus}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              {payoutEnabled ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  <FaCheckCircle className="text-xs" />
                  Ready for Payouts
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                  <FaExclamationTriangle className="text-xs" />
                  Setup Required
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {!payoutEnabled && (
              <>
                {isRefreshingLink ? (
                  <div className="flex flex-1 items-center justify-center p-2">
                    <Loader />
                  </div>
                ) : (
                  <button
                    onClick={handleRefreshLink}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-light-primary px-4 py-2 font-medium text-white transition-colors hover:opacity-90 dark:bg-dark-primary"
                  >
                    <FaExternalLinkAlt />
                    Complete Setup
                  </button>
                )}
              </>
            )}

            {isLoadingDashboard ? (
              <div className="flex flex-1 items-center justify-center p-2">
                <Loader />
              </div>
            ) : (
              <button
                onClick={handleOpenDashboard}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-light-border px-4 py-2 text-light-text transition-colors hover:bg-light-background dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-background"
              >
                <FaExternalLinkAlt />
                Open Stripe Dashboard
              </button>
            )}
          </div>

          {/* Status details */}
          <div className="space-y-2 text-sm text-light-text/70 dark:text-dark-text/70">
            {payoutEnabled ? (
              <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                <p className="flex items-center gap-2 text-green-800 dark:text-green-400">
                  <FaCheckCircle /> Your account is fully set up and ready to
                  receive payments!
                </p>
              </div>
            ) : (
              <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
                <p className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
                  <FaExclamationTriangle /> Complete your Stripe setup to start
                  receiving payments from contracts.
                </p>
                {connectStatus?.data?.requirementsDue?.length > 0 && (
                  <p className="mt-2 text-sm">
                    Missing requirements:{' '}
                    {connectStatus.data.requirementsDue.join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Platform fee info */}
          <div className="rounded-lg bg-light-surface p-3 text-xs text-light-text/60 dark:bg-dark-surface dark:text-dark-text/60">
            <p>
              <FaLightbulb className="mr-1 inline" />{' '}
              <strong>How payments work:</strong> When a contract is completed,
              you&apos;ll receive 97.5% of the agreed amount (2.5% platform fee
              is deducted). Payments are automatically transferred to your bank
              account within 2-7 business days.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
