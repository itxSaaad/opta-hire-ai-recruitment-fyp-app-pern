import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import {
  FaBriefcase,
  FaCheckCircle,
  FaCreditCard,
  FaDollarSign,
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
      <div className="space-y-4 text-left">
        <div className="py-8 text-center">
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
      </div>
    );
  }

  return (
    <div className="space-y-4 text-left">
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
              {contract.job?.title || 'Not specified'}
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
              {contract.interviewer?.firstName} {contract.interviewer?.lastName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {contract.interviewer?.email}
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
              ${contract.agreedPrice}
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
              ${(contract.agreedPrice * 0.025).toFixed(2)}
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
              ${(contract.agreedPrice * 0.975).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Error */}
      {paymentError && (
        <div className="border-b border-light-border pb-4 dark:border-dark-border">
          <Alert message={paymentError} />
        </div>
      )}

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card Information */}
        <div className="border-b border-light-border pb-4 dark:border-dark-border">
          <div className="flex items-start">
            <div className="mr-4 mt-1 flex w-6 min-w-[24px] justify-center">
              <FaCreditCard
                className="text-light-primary dark:text-dark-primary"
                size={20}
              />
            </div>
            <div className="w-full">
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                Card Information
              </p>
              <div className="rounded-lg border border-light-border p-4 dark:border-dark-border">
                <CardElement
                  options={
                    isDarkMode
                      ? CARD_ELEMENT_OPTIONS_DARK
                      : CARD_ELEMENT_OPTIONS
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
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
                Security Information
              </p>
              <p className="text-sm text-light-text/60 dark:text-dark-text/60">
                Your payment is secured by Stripe. Funds will be held in escrow
                until contract completion.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 rounded bg-gray-200 px-4 py-2 text-gray-800 transition-all duration-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            <FaTimes />
            Cancel
          </button>

          {isProcessing || isCreatingPayment || isConfirmingPayment ? (
            <div className="flex items-center justify-center px-4 py-2">
              <Loader />
            </div>
          ) : (
            <button
              type="submit"
              disabled={!stripe}
              className="flex items-center gap-2 rounded bg-light-primary px-4 py-2 font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-400 dark:bg-dark-primary"
            >
              <FaCreditCard />
              Pay Now
            </button>
          )}
        </div>
      </form>
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
