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

import { useRegenerateOTPMutation } from '../../features/auth/authApi';
import { logoutUser, setUserInfo } from '../../features/auth/authSlice';
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

  return (
    <>
      <Helmet>
        <title>Verify Your Profile - OptaHire</title>
        <meta
          name="description"
          content="Please verify your email to access your OptaHire account."
        />
      </Helmet>
      <section className="min-h-screen flex flex-col items-center justify-center py-16 px-4 bg-light-background dark:bg-dark-background">
        <button
          onClick={() => {
            dispatch(logoutUser());
            navigate('/auth/login');
          }}
          className="absolute top-4 left-4 text-light-text dark:text-dark-text hover:text-light-primary dark:hover:text-dark-primary transition-all"
        >
          <FaSignOutAlt className="inline-block -mt-1 mr-2" />
          Logout
        </button>
        <div className="w-full max-w-sm sm:max-w-md relative animate-fadeIn">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-light-primary dark:text-dark-primary mb-4">
            Verify Your Email
          </h2>

          <p className="text-center text-light-text dark:text-dark-text mb-6">
            An OTP has been sent to <strong>{user?.email}</strong>. Please enter
            the OTP below to verify your email.
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

          {isResendingOtp || isVerifyingEmail ? (
            <Loader />
          ) : (
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
              <div className="flex justify-end mb-2">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-sm text-light-primary dark:text-dark-primary hover:text-light-secondary dark:hover:text-dark-secondary transition-all"
                >
                  Resend OTP
                </button>
              </div>
              <button
                type="submit"
                className="w-full bg-light-primary dark:bg-dark-primary text-white py-3 rounded-lg font-semibold text-lg hover:bg-light-secondary dark:hover:bg-dark-secondary transition-all duration-300 shadow-md"
              >
                Verify Email
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

export default VerifyProfileScreen;
