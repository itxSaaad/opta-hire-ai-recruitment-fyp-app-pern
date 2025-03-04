import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaArrowLeft, FaEnvelope, FaKey } from 'react-icons/fa';
import { Link, ScrollRestoration, useNavigate } from 'react-router-dom';

import ErrorMsg from '../../components/ErrorMsg';
import Loader from '../../components/Loader';
import InputField from '../../components/ui/mainLayout/InputField';

import { validateEmail, validatePassword } from '../../utils/validations';

import {
  useForgotPasswordMutation,
  useRegenerateOTPMutation,
  useResetPasswordMutation,
} from '../../features/auth/authApi';

export default function ResetPwdScreen() {
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

  const [forgotPassword, { isLoading: isSendingOtp, error: otpError }] =
    useForgotPasswordMutation();
  const [regenerateOTP, { isLoading: isResendingOtp, error: resendError }] =
    useRegenerateOTPMutation();
  const [resetPassword, { isLoading: isChangingPwd, error: pwdError }] =
    useResetPasswordMutation();

  const handleSendOtp = async () => {
    const emailError = validateEmail(email);

    if (emailError) {
      setErrors({ email: emailError });
      return;
    }

    try {
      await forgotPassword({ email }).unwrap();
      setIsOtpSent(true);
    } catch (err) {
      console.error('Failed to send reset email:', err);
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
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        email: err.data?.message || 'Failed to resend OTP',
      }));
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
      await resetPassword({ email, otp, newPassword }).unwrap();
      navigate('/auth/login');
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        otp: err.data?.message || 'Failed to change password',
      }));
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-6">
        <div className="flex flex-col items-center p-3 text-light-primary dark:text-dark-primary scale-110">
          <FaEnvelope size={28} />
        </div>
        <div
          className={`w-20 h-1 rounded-full ${
            isOtpSent
              ? 'bg-light-primary dark:bg-dark-primary'
              : 'bg-gray-300 dark:bg-gray-700'
          }`}
        />
        <div
          className={`flex flex-col items-center p-3 ${
            isOtpSent
              ? 'text-light-primary dark:text-dark-primary scale-110'
              : 'text-gray-400 dark:text-gray-600'
          }`}
        >
          <FaKey size={28} />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Reset Password - OptaHire</title>
        <meta
          name="description"
          content="Forgot your password? Reset it here to access your OptaHire account."
        />
      </Helmet>
      <section className="min-h-screen flex items-center justify-center py-16 px-4 bg-light-background dark:bg-dark-background">
        <Link
          to="/auth/login"
          className="absolute top-4 left-4 text-light-text dark:text-dark-text hover:text-light-primary dark:hover:text-dark-primary transition-all"
        >
          <FaArrowLeft className="inline-block -mt-1 mr-2" />
          Back to Login
        </Link>

        <div className="w-full max-w-sm sm:max-w-md relative animate-fadeIn">
          {isSendingOtp || isResendingOtp || isChangingPwd ? (
            <Loader />
          ) : (
            <>
              <StepIndicator />
              <h2 className="text-3xl sm:text-4xl font-bold text-center text-light-primary dark:text-dark-primary mb-4 sm:mb-6">
                {isOtpSent ? 'Enter OTP' : 'Forgot Password?'}
              </h2>
              <p className="text-center text-light-text dark:text-dark-text mb-6 sm:mb-8">
                {isOtpSent
                  ? 'Enter the OTP sent to your email and set your new password.'
                  : 'Enter your email to receive an OTP and set your new password.'}
              </p>

              {(otpError || resendError || pwdError) && (
                <ErrorMsg
                  errorMsg={
                    otpError?.data?.message ||
                    resendError?.data?.message ||
                    pwdError?.data?.message
                  }
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
                      className="w-full bg-light-primary dark:bg-dark-primary text-white py-3 rounded-lg font-semibold text-lg hover:bg-light-secondary dark:hover:bg-dark-secondary active:scale-98 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Send OTP
                    </button>
                  </>
                ) : (
                  <>
                    {isOtpSent && (
                      <div className="flex justify-start mb-2">
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
                          className="text-sm text-light-primary dark:text-dark-primary hover:text-light-secondary dark:hover:text-dark-secondary transition-all flex items-center"
                        >
                          <FaArrowLeft className="mr-2" />
                          Change Email
                        </button>
                      </div>
                    )}
                    <InputField
                      id="otp"
                      type="text"
                      label="OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      validationMessage={errors.otp}
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
                      className="w-full bg-light-primary dark:bg-dark-primary text-white py-3 rounded-lg font-semibold text-lg hover:bg-light-secondary dark:hover:bg-dark-secondary active:scale-98 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Change Password
                    </button>
                  </>
                )}
              </form>

              <div className="text-center mt-4 sm:mt-6">
                <p className="text-light-text dark:text-dark-text">
                  Remember your password?{' '}
                  <Link
                    to="/auth/login"
                    className="text-light-primary dark:text-dark-primary hover:text-light-secondary dark:hover:text-dark-secondary transition-all duration-200"
                  >
                    Login
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </section>
      <ScrollRestoration />
    </>
  );
}
