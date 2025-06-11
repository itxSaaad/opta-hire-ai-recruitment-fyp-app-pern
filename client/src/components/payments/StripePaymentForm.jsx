// components/payments/StripePaymentForm.jsx
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { FaCheckCircle, FaCreditCard, FaTimes } from 'react-icons/fa';

import Alert from '../Alert';
import Loader from '../Loader';

import { trackEvent } from '../../utils/analytics';

import {
  useConfirmContractPaymentMutation,
  useCreateContractPaymentMutation,
} from '../../features/payment/paymentApi';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Card element styling to match your theme
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#1A1A1A',
      fontFamily: '"Inter", "Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#9CA3AF',
      },
    },
    invalid: {
      color: '#EF4444',
      iconColor: '#EF4444',
    },
  },
};

// Dark mode card element styling
const CARD_ELEMENT_OPTIONS_DARK = {
  style: {
    base: {
      color: '#ffffff',
      fontFamily: '"Inter", "Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#6B7280',
      },
    },
    invalid: {
      color: '#EF4444',
      iconColor: '#EF4444',
    },
  },
};

// Payment form component (wrapped by Elements)
function PaymentForm({ contract, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [createPayment, { isLoading: isCreatingPayment }] =
    useCreateContractPaymentMutation();
  const [confirmPayment, { isLoading: isConfirmingPayment }] =
    useConfirmContractPaymentMutation();

  // Check for dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Create payment intent when component mounts
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        trackEvent(
          'Payment',
          'Payment Intent Started',
          `Creating payment for contract ${contract.id}`
        );

        const result = await createPayment(contract.id).unwrap();
        setClientSecret(result.data.clientSecret);

        trackEvent(
          'Payment',
          'Payment Intent Created',
          `Payment intent created successfully`
        );
      } catch (error) {
        const errorMessage = error.data?.message || 'Failed to create payment';
        setPaymentError(errorMessage);

        trackEvent('Payment', 'Payment Intent Failed', errorMessage);
      }
    };

    createPaymentIntent();
  }, [contract.id, createPayment]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    trackEvent(
      'Payment',
      'Payment Submission Started',
      `User submitted payment for contract ${contract.id}`
    );

    const card = elements.getElement(CardElement);

    // Confirm the payment with Stripe
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: card,
          billing_details: {
            name: `${contract.recruiter?.firstName} ${contract.recruiter?.lastName}`,
            email: contract.recruiter?.email,
          },
        },
      }
    );

    if (error) {
      setPaymentError(error.message);
      setIsProcessing(false);

      trackEvent('Payment', 'Payment Failed', error.message);
    } else if (paymentIntent.status === 'succeeded') {
      try {
        // Confirm payment with our backend
        await confirmPayment({
          contractId: contract.id,
          paymentIntentId: paymentIntent.id,
        }).unwrap();

        trackEvent(
          'Payment',
          'Payment Successful',
          `Payment completed for contract ${contract.id}`
        );

        setPaymentSuccess(true);
        setTimeout(() => {
          onSuccess && onSuccess();
        }, 2000);
      } catch (error) {
        const errorMessage =
          error.data?.message || 'Payment confirmation failed';
        setPaymentError(errorMessage);

        trackEvent('Payment', 'Payment Confirmation Failed', errorMessage);
      }
    }

    setIsProcessing(false);
  };

  if (isCreatingPayment) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader />
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="animate-fadeIn py-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <FaCheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-green-600 dark:text-green-400">
          Payment Successful!
        </h3>
        <p className="text-light-text/70 dark:text-dark-text/70">
          Your payment has been processed and the contract is now active.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="text-center">
        <h3 className="mb-2 text-lg font-semibold text-light-text dark:text-dark-text">
          Pay for Contract
        </h3>
        <p className="mb-4 text-light-text/70 dark:text-dark-text/70">
          Job: {contract.job?.title}
        </p>
        <div className="mb-4 rounded-lg bg-light-surface p-4 dark:bg-dark-surface">
          <p className="text-xl font-bold text-light-text dark:text-dark-text">
            Amount: ${contract.agreedPrice}
          </p>
          <p className="text-sm text-light-text/60 dark:text-dark-text/60">
            Platform fee (2.5%): ${(contract.agreedPrice * 0.025).toFixed(2)}
          </p>
          <p className="text-sm text-light-text/60 dark:text-dark-text/60">
            Interviewer receives: ${(contract.agreedPrice * 0.975).toFixed(2)}
          </p>
        </div>
      </div>

      {paymentError && <Alert message={paymentError} />}

      <form onSubmit={handleSubmit} className="animate-slideUp space-y-4">
        <div className="rounded-lg border border-light-border p-4 dark:border-dark-border">
          <label className="mb-2 block text-sm font-medium text-light-text dark:text-dark-text">
            Card Information
          </label>
          <CardElement
            options={
              isDarkMode ? CARD_ELEMENT_OPTIONS_DARK : CARD_ELEMENT_OPTIONS
            }
          />
        </div>

        <div className="flex gap-3">
          {isProcessing || isCreatingPayment || isConfirmingPayment ? (
            <div className="flex flex-1 items-center justify-center p-2">
              <Loader />
            </div>
          ) : (
            <button
              type="submit"
              disabled={!stripe}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-light-primary px-4 py-2 font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-400 dark:bg-dark-primary"
            >
              <FaCreditCard />
              Pay Now
            </button>
          )}

          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 rounded-lg border border-light-border px-4 py-2 text-light-text transition-colors hover:bg-light-background dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-background"
          >
            <FaTimes />
            Cancel
          </button>
        </div>
      </form>

      <div className="rounded-lg bg-light-surface p-3 text-center text-xs text-light-text/60 dark:bg-dark-surface dark:text-dark-text/60">
        Your payment is secured by Stripe. Funds will be held in escrow until
        contract completion.
      </div>
    </div>
  );
}

PaymentForm.propTypes = {
  contract: PropTypes.object.isRequired,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
};

// Main component that provides Stripe context
export default function StripePaymentForm({ contract, onSuccess, onCancel }) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        contract={contract}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
}

StripePaymentForm.propTypes = {
  contract: PropTypes.object.isRequired,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
};
