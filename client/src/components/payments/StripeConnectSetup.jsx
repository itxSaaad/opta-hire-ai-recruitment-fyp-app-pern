import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import {
  FaCheckCircle,
  FaClock,
  FaCog,
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaInfoCircle,
  FaLightbulb,
  FaMoneyBillWave,
  FaPercent,
  FaShieldAlt,
  FaTimes,
  FaUser,
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

export default function StripeConnectSetup({ onClose }) {
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

  if (
    isLoadingStatus ||
    isLoadingDashboard ||
    isRefreshingLink ||
    isCreatingAccount
  ) {
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
    <div className="space-y-4 text-left">
      {/* Account Status */}
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
              Payment Account Status
            </p>
            <p className="text-lg font-medium text-light-text dark:text-dark-text">
              {hasAccount
                ? 'Stripe Connect Account Created'
                : 'No Account Setup'}
            </p>
            {hasAccount && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Status: <span className="capitalize">{accountStatus}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Setup Status */}
      <div className="border-b border-light-border pb-4 dark:border-dark-border">
        <div className="flex items-start">
          <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
            {payoutEnabled ? (
              <FaCheckCircle
                className="text-green-600 dark:text-green-400"
                size={20}
              />
            ) : (
              <FaExclamationTriangle
                className="text-yellow-600 dark:text-yellow-400"
                size={20}
              />
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Payout Capability
            </p>
            <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* Missing Requirements (if any) */}
      {connectStatus?.data?.requirementsDue?.length > 0 && (
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
                Missing Requirements
              </p>
              <p className="text-lg font-medium text-light-text dark:text-dark-text">
                {connectStatus.data.requirementsDue.join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Platform Fee Information */}
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
              Platform Fee
            </p>
            <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
              2.5% per contract
            </p>
            <p className="text-sm text-light-text/70 dark:text-dark-text/70">
              Deducted from your earnings automatically
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
              You Receive
            </p>
            <p className="text-lg font-medium text-green-600 dark:text-green-400">
              97.5% of contract value
            </p>
            <p className="text-sm text-light-text/70 dark:text-dark-text/70">
              Automatically transferred to your bank account
            </p>
          </div>
        </div>
      </div>

      {/* Transfer Timeline */}
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
              Transfer Timeline
            </p>
            <p className="text-lg font-medium text-light-text dark:text-dark-text">
              2-7 business days
            </p>
            <p className="text-sm text-light-text/70 dark:text-dark-text/70">
              After contract completion and payout processing
            </p>
          </div>
        </div>
      </div>

      {/* Security Information */}
      <div className="border-b border-light-border pb-4 dark:border-dark-border">
        <div className="flex items-start">
          <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
            <FaShieldAlt
              className="text-light-primary dark:text-dark-primary"
              size={20}
            />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Security & Compliance
            </p>
            <p className="text-sm text-light-text/60 dark:text-dark-text/60">
              Your financial information is secured by Stripe, a PCI DSS Level 1
              certified payment processor trusted by millions of businesses
              worldwide.
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {(statusError || createError || refreshError || dashboardError) && (
        <div className="border-b border-light-border pb-4 dark:border-dark-border">
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

      {/* Status Messages */}
      <div className="border-b border-light-border pb-4 dark:border-dark-border">
        <div className="flex items-start">
          <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
            <FaLightbulb
              className="text-light-primary dark:text-dark-primary"
              size={20}
            />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Current Status
            </p>
            {payoutEnabled ? (
              <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                <p className="flex items-center gap-2 text-green-800 dark:text-green-400">
                  <FaCheckCircle size={16} />
                  Your account is fully set up and ready to receive payments!
                </p>
              </div>
            ) : hasAccount ? (
              <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
                <p className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
                  <FaExclamationTriangle size={16} />
                  Complete your Stripe setup to start receiving payments from
                  contracts.
                </p>
              </div>
            ) : (
              <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                <p className="flex items-center gap-2 text-blue-800 dark:text-blue-400">
                  <FaInfoCircle size={16} />
                  Set up your Stripe Connect account to receive payments and
                  accept contracts.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 rounded bg-gray-200 px-4 py-2 text-gray-800 transition-all duration-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          <FaTimes />
          Close
        </button>

        {!hasAccount ? (
          // No account - show setup button

          <button
            onClick={handleCreateAccount}
            className="flex items-center gap-2 rounded bg-light-primary px-4 py-2 font-medium text-white transition-colors hover:opacity-90 dark:bg-dark-primary"
          >
            <FaExternalLinkAlt />
            Set Up Stripe Account
          </button>
        ) : (
          // Has account - show management buttons
          <>
            {!payoutEnabled && (
              <button
                onClick={handleRefreshLink}
                className="flex items-center gap-2 rounded bg-light-primary px-4 py-2 font-medium text-white transition-colors hover:opacity-90 dark:bg-dark-primary"
              >
                <FaExternalLinkAlt />
                Complete Setup
              </button>
            )}

            <button
              onClick={handleOpenDashboard}
              className="flex items-center gap-2 rounded border border-light-border px-4 py-2 text-light-text transition-colors hover:bg-light-background dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-background"
            >
              <FaCog />
              Stripe Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

StripeConnectSetup.propTypes = {
  onClose: PropTypes.func.isRequired,
};
