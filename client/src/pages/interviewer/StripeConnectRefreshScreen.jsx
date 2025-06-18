import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaArrowLeft, FaExternalLinkAlt, FaRedo } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';

import { trackEvent, trackPageView } from '../../utils/analytics';

import { useRefreshStripeConnectLinkMutation } from '../../features/payment/paymentApi';

export default function StripeConnectRefresh() {
  const navigate = useNavigate();
  const [refreshLink, { isLoading, error }] =
    useRefreshStripeConnectLinkMutation();

  useEffect(() => {
    trackPageView(window.location.pathname);
  }, []);

  useEffect(() => {
    const handleRefresh = async () => {
      try {
        trackEvent(
          'Stripe Connect',
          'Refresh Link Initiated',
          'User accessed refresh page'
        );

        const result = await refreshLink().unwrap();

        trackEvent(
          'Stripe Connect',
          'Refresh Link Success',
          'Redirect to Stripe onboarding'
        );

        // Redirect to the refreshed onboarding link
        window.location.href = result.data.onboardingUrl;
      } catch (err) {
        console.error('Failed to refresh Stripe Connect link:', err);

        trackEvent(
          'Stripe Connect',
          'Refresh Link Failed',
          err.data?.message || 'Unknown error'
        );

        // Redirect back to contracts with error state
        navigate('/interviewer/contracts', {
          state: {
            stripeError: 'Failed to refresh setup link. Please try again.',
          },
        });
      }
    };

    handleRefresh();
  }, [refreshLink, navigate]);

  const handleReturnToContracts = () => {
    trackEvent(
      'Stripe Connect Refresh',
      'Return to Contracts',
      'User clicked return to contracts'
    );
    navigate('/interviewer/contracts');
  };

  return (
    <>
      <Helmet>
        <title>
          Payment Setup Refresh - OptaHire | Complete Stripe Connect Setup
        </title>
        <meta
          name="description"
          content="Refresh your Stripe Connect setup on OptaHire. Complete your payment configuration to start receiving payments for interview services."
        />
        <meta
          name="keywords"
          content="OptaHire Stripe Setup, Payment Configuration, Interviewer Payments, Stripe Connect, Payment Refresh"
        />
      </Helmet>

      <section className="flex min-h-screen animate-fadeIn items-center justify-center bg-light-background px-4 py-24 dark:bg-dark-background">
        {isLoading ? (
          <div className="mx-auto w-full max-w-sm sm:max-w-md">
            <Loader />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-4xl animate-slideUp rounded-lg border border-light-border bg-light-surface p-8 text-center shadow-lg transition-all duration-500 hover:shadow-xl dark:border-dark-border dark:bg-dark-surface">
            {error && (
              <Alert
                message={error.data?.message || 'Failed to refresh setup link'}
              />
            )}

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-0.5 w-full bg-blue-100 dark:bg-blue-900"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="rounded-full bg-blue-100 p-4 dark:bg-blue-900">
                  <FaRedo
                    className="mx-auto text-light-primary dark:text-dark-primary"
                    size={64}
                  />
                </span>
              </div>
            </div>

            <h1 className="mb-6 text-center text-3xl font-bold text-light-text dark:text-dark-text sm:text-4xl md:text-5xl">
              Complete Payment{' '}
              <span className="text-light-primary dark:text-dark-primary">
                Setup
              </span>
            </h1>
            <p className="mb-8 text-center text-lg text-light-text/70 dark:text-dark-text/70">
              Finish setting up your payment account to start receiving payments
              for your professional interview services.
            </p>

            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center rounded-lg bg-light-background p-4 transition-all duration-300 hover:shadow-md dark:bg-dark-background">
                <FaExternalLinkAlt
                  className="mr-3 text-light-primary dark:text-dark-primary"
                  size={24}
                />
                <div className="text-left">
                  <h3 className="font-medium text-light-text dark:text-dark-text">
                    Secure Setup
                  </h3>
                  <p className="text-sm text-light-text/70 dark:text-dark-text/70">
                    You&apos;ll be redirected to Stripe&apos;s secure onboarding
                    process
                  </p>
                </div>
              </div>
              <div className="flex items-center rounded-lg bg-light-background p-4 transition-all duration-300 hover:shadow-md dark:bg-dark-background">
                <FaRedo
                  className="mr-3 text-light-primary dark:text-dark-primary"
                  size={24}
                />
                <div className="text-left">
                  <h3 className="font-medium text-light-text dark:text-dark-text">
                    Quick Process
                  </h3>
                  <p className="text-sm text-light-text/70 dark:text-dark-text/70">
                    Setup takes just a few minutes to complete
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button
                onClick={handleReturnToContracts}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 rounded-lg border border-light-primary px-6 py-3 text-light-primary transition-all duration-300 hover:bg-light-primary/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-primary dark:text-dark-primary dark:hover:bg-dark-primary/10"
              >
                <FaArrowLeft size={16} />
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
