import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaArrowLeft,
  FaCheckCircle,
  FaCog,
  FaExclamationTriangle,
  FaWallet,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';

import { trackEvent, trackPageView } from '../../utils/analytics';

import { useGetStripeConnectStatusQuery } from '../../features/payment/paymentApi';

export default function StripeConnectReturn() {
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('checking');
  const [statusMessage, setStatusMessage] = useState('');

  const {
    data: connectStatus,
    isLoading,
    error,
    refetch,
  } = useGetStripeConnectStatusQuery();

  useEffect(() => {
    trackPageView(window.location.pathname);
  }, []);

  useEffect(() => {
    // Delay the status check to allow Stripe's webhook to process
    const checkStatus = setTimeout(() => {
      refetch();
    }, 2000);

    return () => clearTimeout(checkStatus);
  }, [refetch]);

  useEffect(() => {
    if (!isLoading && connectStatus) {
      const { hasAccount, payoutEnabled } = connectStatus.data;

      if (hasAccount && payoutEnabled) {
        setVerificationStatus('success');
        setStatusMessage(
          'Your Stripe Connect account has been successfully set up!'
        );

        trackEvent(
          'Stripe Connect',
          'Setup Successful',
          'User completed Stripe Connect setup'
        );

        // Redirect to contracts page after 3 seconds
        setTimeout(() => {
          navigate('/interviewer/contracts');
        }, 3000);
      } else if (hasAccount && !payoutEnabled) {
        setVerificationStatus('partial');
        setStatusMessage(
          'Your account was created but requires additional verification. Please complete the setup process.'
        );

        trackEvent(
          'Stripe Connect',
          'Partial Setup',
          'User needs additional verification'
        );
      } else {
        setVerificationStatus('failed');
        setStatusMessage('Account setup was not completed. Please try again.');

        trackEvent(
          'Stripe Connect',
          'Setup Failed',
          'User setup was not completed'
        );
      }
    }
  }, [connectStatus, isLoading, navigate]);

  useEffect(() => {
    if (error) {
      setVerificationStatus('error');
      setStatusMessage('Failed to verify account status. Please try again.');

      trackEvent(
        'Stripe Connect',
        'Verification Error',
        error.data?.message || 'Unknown error'
      );
    }
  }, [error]);

  const handleReturnToContracts = () => {
    trackEvent(
      'Stripe Connect Return',
      'Return to Contracts',
      'User clicked return to contracts'
    );
    navigate('/interviewer/contracts');
  };

  const handleRetrySetup = () => {
    trackEvent(
      'Stripe Connect Return',
      'Retry Setup',
      'User clicked retry setup'
    );
    navigate('/interviewer/contracts', {
      state: { openStripeModal: true },
    });
  };

  return (
    <>
      <Helmet>
        <title>
          Payment Setup Complete - OptaHire | Stripe Connect Success
        </title>
        <meta
          name="description"
          content="Payment setup completed successfully on OptaHire. Your Stripe Connect account is ready to receive payments for interview services."
        />
        <meta
          name="keywords"
          content="OptaHire Payment Success, Stripe Connect Complete, Interviewer Payments Ready, Payment Configuration Success"
        />
      </Helmet>

      <section className="flex min-h-screen animate-fadeIn items-center justify-center bg-light-background px-4 py-24 dark:bg-dark-background">
        {isLoading || verificationStatus === 'checking' ? (
          <div className="mx-auto w-full max-w-sm sm:max-w-md">
            <Loader />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-4xl animate-slideUp rounded-lg border border-light-border bg-light-surface p-8 text-center shadow-lg transition-all duration-500 hover:shadow-xl dark:border-dark-border dark:bg-dark-surface">
            {error && (
              <Alert message={error.data?.message || 'An error occurred'} />
            )}

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className={`h-0.5 w-full ${
                    verificationStatus === 'success'
                      ? 'bg-green-100 dark:bg-green-900'
                      : verificationStatus === 'partial'
                        ? 'bg-yellow-100 dark:bg-yellow-900'
                        : 'bg-red-100 dark:bg-red-900'
                  }`}
                ></div>
              </div>
              <div className="relative flex justify-center">
                <span
                  className={`rounded-full p-4 ${
                    verificationStatus === 'success'
                      ? 'bg-green-100 dark:bg-green-900'
                      : verificationStatus === 'partial'
                        ? 'bg-yellow-100 dark:bg-yellow-900'
                        : 'bg-red-100 dark:bg-red-900'
                  }`}
                >
                  {verificationStatus === 'success' ? (
                    <FaCheckCircle
                      className="mx-auto text-green-500 dark:text-green-400"
                      size={64}
                    />
                  ) : (
                    <FaExclamationTriangle
                      className={`mx-auto ${
                        verificationStatus === 'partial'
                          ? 'text-yellow-500 dark:text-yellow-400'
                          : 'text-red-500 dark:text-red-400'
                      }`}
                      size={64}
                    />
                  )}
                </span>
              </div>
            </div>

            <h1 className="mb-6 text-3xl font-bold text-light-text dark:text-dark-text">
              {verificationStatus === 'success' && (
                <>
                  Setup{' '}
                  <span className="text-light-primary dark:text-dark-primary">
                    Complete!
                  </span>
                </>
              )}
              {verificationStatus === 'partial' && (
                <>
                  Additional{' '}
                  <span className="text-yellow-600 dark:text-yellow-400">
                    Verification Required
                  </span>
                </>
              )}
              {(verificationStatus === 'failed' ||
                verificationStatus === 'error') && (
                <>
                  Setup{' '}
                  <span className="text-red-600 dark:text-red-400">
                    Not Complete
                  </span>
                </>
              )}
            </h1>

            <p className="mb-8 text-lg text-light-text dark:text-dark-text">
              {statusMessage}
            </p>

            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center rounded-lg bg-light-background p-4 transition-all duration-300 hover:shadow-md dark:bg-dark-background">
                <FaWallet
                  className="mr-3 text-light-primary dark:text-dark-primary"
                  size={24}
                />
                <div className="text-left">
                  <h3 className="font-medium text-light-text dark:text-dark-text">
                    Payment Ready
                  </h3>
                  <p className="text-sm text-light-text/70 dark:text-dark-text/70">
                    {verificationStatus === 'success'
                      ? 'You can now accept contracts and receive payments'
                      : 'Complete setup to start receiving payments'}
                  </p>
                </div>
              </div>
              <div className="flex items-center rounded-lg bg-light-background p-4 transition-all duration-300 hover:shadow-md dark:bg-dark-background">
                <FaCog
                  className="mr-3 text-light-primary dark:text-dark-primary"
                  size={24}
                />
                <div className="text-left">
                  <h3 className="font-medium text-light-text dark:text-dark-text">
                    Account Management
                  </h3>
                  <p className="text-sm text-light-text/70 dark:text-dark-text/70">
                    Manage your payment settings in the contracts dashboard
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-4">
              {verificationStatus === 'success' && (
                <>
                  <button
                    onClick={handleReturnToContracts}
                    className="flex transform items-center justify-center gap-2 rounded-lg bg-light-primary px-6 py-3 font-medium text-white transition-all duration-300 hover:-translate-y-1 hover:bg-light-secondary hover:shadow-lg dark:bg-dark-primary dark:hover:bg-dark-secondary"
                  >
                    Go to Contracts Dashboard
                  </button>
                  <p className="mt-2 text-xs text-light-text/60 dark:text-dark-text/60">
                    You will be automatically redirected in a few seconds...
                  </p>
                </>
              )}

              {verificationStatus === 'partial' && (
                <>
                  <button
                    onClick={handleRetrySetup}
                    className="flex transform items-center justify-center gap-2 rounded-lg bg-yellow-600 px-6 py-3 font-medium text-white transition-all duration-300 hover:-translate-y-1 hover:bg-yellow-700 hover:shadow-lg dark:bg-yellow-600 dark:hover:bg-yellow-700"
                  >
                    Complete Verification
                  </button>
                  <button
                    onClick={handleReturnToContracts}
                    className="flex items-center justify-center gap-2 rounded-lg border border-light-primary px-6 py-3 text-light-primary transition-all duration-300 hover:bg-light-primary/10 dark:border-dark-primary dark:text-dark-primary dark:hover:bg-dark-primary/10"
                  >
                    <FaArrowLeft size={16} />
                    Return to Dashboard
                  </button>
                </>
              )}

              {(verificationStatus === 'failed' ||
                verificationStatus === 'error') && (
                <>
                  <button
                    onClick={handleRetrySetup}
                    className="flex transform items-center justify-center gap-2 rounded-lg bg-light-primary px-6 py-3 font-medium text-white transition-all duration-300 hover:-translate-y-1 hover:bg-light-secondary hover:shadow-lg dark:bg-dark-primary dark:hover:bg-dark-secondary"
                  >
                    Try Setup Again
                  </button>
                  <button
                    onClick={handleReturnToContracts}
                    className="flex items-center justify-center gap-2 rounded-lg border border-light-primary px-6 py-3 text-light-primary transition-all duration-300 hover:bg-light-primary/10 dark:border-dark-primary dark:text-dark-primary dark:hover:bg-dark-primary/10"
                  >
                    <FaArrowLeft size={16} />
                    Return to Dashboard
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
