import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaSignOutAlt } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import InputField from '../../components/ui/mainLayout/InputField';

import { trackEvent, trackPageView } from '../../utils/analytics';
import { getExpectedRoute } from '../../utils/helpers';

import { logoutUser, setUserInfo } from '../../features/auth/authSlice';

import { useRegenerateOTPMutation } from '../../features/auth/authApi';
import { useVerifyEmailMutation } from '../../features/user/userApi';

function VerifyProfileScreen() {
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { userInfo: user } = useSelector((state) => state.auth);

  const [
    verifyEmail,
    {
      isLoading: isVerifyingEmail,
      error: verifyError,
      isSuccess: verifySuccess,
      data: VerifyData,
    },
  ] = useVerifyEmailMutation();

  const [
    regenerateOTP,
    {
      isLoading: isResendingOtp,
      error: resendError,
      isSuccess: regenerateOTPSuccess,
      data: regenerateOTPData,
    },
  ] = useRegenerateOTPMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit OTP.');
      trackEvent(
        'Authentication',
        'Email Verification',
        'Failed - Invalid OTP'
      );
      return;
    }

    try {
      const result = await verifyEmail({ email: user.email, otp }).unwrap();
      dispatch(setUserInfo(result.user));
      trackEvent('Authentication', 'Email Verification', 'Success');

      const expectedRoute = getExpectedRoute(user);
      navigate(expectedRoute);
    } catch (err) {
      setErrorMsg(err.data?.message || 'Verification failed.');
      trackEvent(
        'Authentication',
        'Email Verification',
        `Failed - ${err.data?.message || 'Server Error'}`
      );
    }
  };

  const handleResendOtp = async () => {
    try {
      if (user?.email) {
        await regenerateOTP({ email: user.email }).unwrap();
        trackEvent('Authentication', 'Resend OTP', 'Success');
      }
    } catch (err) {
      setErrorMsg(err.data?.message || 'Failed to resend OTP.');
      trackEvent(
        'Authentication',
        'Resend OTP',
        `Failed - ${err.data?.message || 'Server Error'}`
      );
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
    }

    return () => {
      setErrorMsg('');
    };
  }, [user, navigate]);

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  const isLoading = isResendingOtp || isVerifyingEmail;
  return (
    <>
      <Helmet>
        <title>Verify Account - OptaHire | Complete Account Setup</title>
        <meta
          name="description"
          content="Verify your OptaHire account to unlock full platform features. Complete your secure account verification process."
        />
        <meta
          name="keywords"
          content="OptaHire Verify Account, Account Verification, Complete Setup, Secure Verification"
        />
      </Helmet>

      <section className="flex min-h-screen flex-col items-center justify-center bg-light-background px-4 py-16 dark:bg-dark-background">
        <button
          onClick={() => {
            dispatch(logoutUser());
            navigate('/auth/login');
          }}
          className="absolute left-4 top-4 text-light-text transition-all hover:text-light-primary dark:text-dark-text dark:hover:text-dark-primary"
        >
          <FaSignOutAlt className="-mt-1 mr-2 inline-block" />
          Logout
        </button>
        {isLoading ? (
          <div className="relative w-full max-w-sm animate-fadeIn sm:max-w-md">
            <Loader />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-lg animate-slideUp">
            <h1 className="mb-6 text-center text-3xl font-bold text-light-text dark:text-dark-text sm:text-4xl md:text-5xl">
              Verify{' '}
              <span className="text-light-primary dark:text-dark-primary">
                Account
              </span>
            </h1>
            <p className="mb-8 text-center text-lg text-light-text/70 dark:text-dark-text/70">
              Complete your account verification to unlock all OptaHire features
              and start your recruitment journey.
            </p>

            <p className="mb-6 text-center text-light-text dark:text-dark-text">
              Please enter the OTP sent to <strong>{user?.email}</strong> to
              verify your email.
            </p>

            {(resendError || verifyError || errorMsg) && (
              <Alert
                message={
                  resendError?.data?.message ||
                  verifyError?.data?.message ||
                  errorMsg
                }
              />
            )}

            {verifySuccess && VerifyData?.data?.message && (
              <Alert
                message={VerifyData?.data?.message}
                isSuccess={verifySuccess}
              />
            )}

            {regenerateOTPSuccess && regenerateOTPData?.data?.message && (
              <Alert
                message={regenerateOTPData?.data?.message}
                isSuccess={regenerateOTPSuccess}
              />
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <InputField
                id="otp"
                type="text"
                label="OTP"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  setErrorMsg('');
                }}
                validationMessage={
                  otp && otp.length !== 6 ? 'OTP must be 6 digits' : ''
                }
              />
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-sm text-light-primary transition-all hover:text-light-secondary dark:text-dark-primary dark:hover:text-dark-secondary"
                >
                  Resend OTP
                </button>
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-light-primary py-3 text-lg font-semibold text-white shadow-md transition-all duration-300 hover:bg-light-secondary dark:bg-dark-primary dark:hover:bg-dark-secondary"
              >
                Verify Email
              </button>
            </form>
          </div>
        )}
      </section>
    </>
  );
}

export default VerifyProfileScreen;
