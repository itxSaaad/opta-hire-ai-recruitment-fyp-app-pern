import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaArrowLeft, FaEnvelope, FaKey } from 'react-icons/fa';
import {
  Link,
  ScrollRestoration,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import InputField from '../../components/ui/mainLayout/InputField';

import { trackEvent, trackPageView } from '../../utils/analytics';
import { validateEmail, validatePassword } from '../../utils/validations';

import {
  useForgotPasswordMutation,
  useRegenerateOTPMutation,
  useResetPasswordMutation,
} from '../../features/auth/authApi';

function ResetPwdScreen() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();
  const location = useLocation();

  const [
    forgotPassword,
    {
      isLoading: isSendingOtp,
      error: otpError,
      isSuccess: forgotPasswordSuccess,
      data: forgotPasswordData,
    },
  ] = useForgotPasswordMutation();
  const [
    regenerateOTP,
    {
      isLoading: isResendingOtp,
      error: resendError,
      isSuccess: regenerateOTPSuccess,
      data: regenerateOTPData,
    },
  ] = useRegenerateOTPMutation();
  const [
    resetPassword,
    {
      isLoading: isChangingPwd,
      error: pwdError,
      isSuccess: resetPasswordSucces,
      data: resetPasswordData,
    },
  ] = useResetPasswordMutation();

  const handleSendOtp = async () => {
    const emailError = validateEmail(email);

    if (emailError) {
      setErrors((prev) => ({ ...prev, email: emailError }));
      return;
    }

    try {
      await forgotPassword({ email }).unwrap();
      setIsOtpSent(true);
      trackEvent('Authentication', 'Forgot Password', 'OTP Sent');
    } catch (err) {
      console.error('Failed to send reset email:', err);
      trackEvent(
        'Authentication',
        'Forgot Password',
        `Failed - ${err.data?.message || 'Server Error'}`
      );
    }
  };

  const handleResendOtp = async () => {
    const emailError = validateEmail(email);

    if (emailError) {
      setErrors((prev) => ({ ...prev, email: emailError }));
      return;
    }

    try {
      await regenerateOTP({ email }).unwrap();
      trackEvent('Authentication', 'Resend OTP', 'Success');
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        email: err.data?.message || 'Failed to resend OTP',
      }));
      trackEvent(
        'Authentication',
        'Resend OTP',
        `Failed - ${err.data?.message || 'Server Error'}`
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(newPassword);

    if (emailError) {
      setErrors((prev) => ({ ...prev, email: emailError }));
      return;
    }

    if (otp.length !== 6) {
      setErrors((prev) => ({ ...prev, otp: 'Invalid OTP' }));
      return;
    }

    if (passwordError) {
      setErrors((prev) => ({ ...prev, newPassword: passwordError }));
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords don't match",
      }));
      return;
    }

    try {
      await resetPassword({ email, otp, password: newPassword }).unwrap();
      navigate('/auth/login');
      trackEvent('Authentication', 'Reset Password', 'Success');
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        otp: err.data?.message || 'Failed to change password',
      }));
      trackEvent(
        'Authentication',
        'Reset Password',
        `Failed - ${err.data?.message || 'Server Error'}`
      );
    }
  };

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  const StepIndicator = () => (
    <div className="mb-8 flex items-center justify-center">
      <div className="flex items-center space-x-6">
        <div className="flex scale-110 flex-col items-center p-3 text-light-primary dark:text-dark-primary">
          <FaEnvelope size={28} />
        </div>
        <div
          className={`h-1 w-20 rounded-full ${
            isOtpSent
              ? 'bg-light-primary dark:bg-dark-primary'
              : 'bg-gray-300 dark:bg-gray-700'
          }`}
        />
        <div
          className={`flex flex-col items-center p-3 ${
            isOtpSent
              ? 'scale-110 text-light-primary dark:text-dark-primary'
              : 'text-gray-400 dark:text-gray-600'
          }`}
        >
          <FaKey size={28} />
        </div>
      </div>
    </div>
  );

  const isLoading = isSendingOtp || isResendingOtp || isChangingPwd;

  return (
    <>
      <Helmet>
        <title>Reset Password - OptaHire | Secure Account Recovery</title>
        <meta
          name="description"
          content="Reset your OptaHire password securely. Regain access to your recruitment account with our secure password recovery process."
        />
        <meta
          name="keywords"
          content="OptaHire Password Reset, Account Recovery, Secure Reset, Forgot Password, Account Access"
        />
      </Helmet>
      <section className="flex min-h-screen items-center justify-center bg-light-background px-4 py-14 dark:bg-dark-background">
        <Link
          to="/auth/login"
          className="absolute left-4 top-4 text-light-text transition-all hover:text-light-primary dark:text-dark-text dark:hover:text-dark-primary"
        >
          <FaArrowLeft className="-mt-1 mr-2 inline-block" />
          Back to Login
        </Link>

        {isLoading ? (
          <div className="relative w-full max-w-sm animate-fadeIn sm:max-w-md">
            <Loader />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-lg animate-slideUp">
            <StepIndicator />
            {isOtpSent ? (
              <>
                <h1 className="mb-6 text-center text-3xl font-bold text-light-text dark:text-dark-text sm:text-4xl md:text-5xl">
                  Enter{' '}
                  <span className="text-light-primary dark:text-dark-primary">
                    OTP
                  </span>
                </h1>
                <p className="mb-8 text-center text-lg text-light-text/70 dark:text-dark-text/70">
                  Enter the OTP sent to your email and set your new password.
                </p>
              </>
            ) : (
              <>
                <h1 className="mb-6 text-center text-3xl font-bold text-light-text dark:text-dark-text sm:text-4xl md:text-5xl">
                  Reset{' '}
                  <span className="text-light-primary dark:text-dark-primary">
                    Password
                  </span>
                </h1>
                <p className="mb-8 text-center text-lg text-light-text/70 dark:text-dark-text/70">
                  Securely reset your password and regain access to your
                  OptaHire recruitment account.
                </p>
              </>
            )}

            {(otpError || resendError || pwdError) && (
              <Alert
                message={
                  otpError?.data?.message ||
                  resendError?.data?.message ||
                  pwdError?.data?.message
                }
              />
            )}

            {forgotPasswordSuccess && forgotPasswordData?.data?.message && (
              <Alert
                message={forgotPasswordData?.data?.message}
                isSuccess={forgotPasswordSuccess}
              />
            )}

            {regenerateOTPSuccess && regenerateOTPData?.data?.message && (
              <Alert
                message={regenerateOTPData?.data?.message}
                isSuccess={regenerateOTPSuccess}
              />
            )}

            {resetPasswordSucces && resetPasswordData?.data?.message && (
              <Alert
                message={resetPasswordData?.data?.message}
                isSuccess={resetPasswordSucces}
              />
            )}

            <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
              {!isOtpSent ? (
                <>
                  <InputField
                    id="email"
                    type="email"
                    label="Email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((prev) => ({
                        ...prev,
                        email: validateEmail(e.target.value),
                      }));
                    }}
                    validationMessage={errors.email}
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="active:scale-98 w-full rounded-lg bg-light-primary py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:bg-light-secondary hover:shadow-xl dark:bg-dark-primary dark:hover:bg-dark-secondary"
                  >
                    Send OTP
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-2 flex justify-start">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOtpSent(false);
                        setOtp('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setErrors({
                          email: '',
                          otp: '',
                          newPassword: '',
                          confirmPassword: '',
                        });
                      }}
                      className="flex items-center text-sm text-light-primary transition-all hover:text-light-secondary dark:text-dark-primary dark:hover:text-dark-secondary"
                    >
                      <FaArrowLeft className="mr-2" />
                      Change Email
                    </button>
                  </div>
                  <InputField
                    id="otp"
                    type="text"
                    label="OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    validationMessage={errors.otp}
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
                  <InputField
                    id="newPassword"
                    type="password"
                    label="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    validationMessage={errors.newPassword}
                  />
                  <InputField
                    id="confirmPassword"
                    type="password"
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    validationMessage={errors.confirmPassword}
                  />
                  <button
                    type="submit"
                    className="active:scale-98 w-full rounded-lg bg-light-primary py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:bg-light-secondary hover:shadow-xl dark:bg-dark-primary dark:hover:bg-dark-secondary"
                  >
                    Change Password
                  </button>
                </>
              )}
            </form>

            <div className="mt-4 text-center sm:mt-6">
              <p className="text-light-text dark:text-dark-text">
                Remember your password?{' '}
                <Link
                  to="/auth/login"
                  className="text-light-primary transition-all duration-200 hover:text-light-secondary dark:text-dark-primary dark:hover:text-dark-secondary"
                  onClick={() => {
                    trackEvent(
                      'Authentication',
                      'Login',
                      'Clicked from Reset Password'
                    );
                  }}
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        )}
      </section>
      <ScrollRestoration />
    </>
  );
}

export default ResetPwdScreen;
