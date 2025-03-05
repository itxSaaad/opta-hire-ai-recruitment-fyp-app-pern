import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaSignOutAlt } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import ErrorMsg from '../../components/ErrorMsg';
import Loader from '../../components/Loader';
import InputField from '../../components/ui/mainLayout/InputField';

import IsAuth from '../../hoc/IsAuth';

import { useRegenerateOTPMutation } from '../../features/auth/authApi';
import { logoutUser } from '../../features/auth/authSlice';

function VerifyProfileScreen() {
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.userInfo);

  // Uncomment and implement verifyEmail mutation when backend is ready.
  // const [verifyEmail, { isLoading: isVerifying, error: verifyError }] =
  //   useVerifyEmailMutation();

  const [regenerateOTP, { isLoading: isResendingOtp, error: resendError }] =
    useRegenerateOTPMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic OTP length validation.
    if (!otp || otp.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit OTP.');
      return;
    }

    try {
      // Uncomment the line below and use verifyEmail when ready.
      // const result = await verifyEmail({ email: user.email, otp }).unwrap();
      // dispatch(setUserInfo(result.user)); // Update the store with verified status.

      // For now, assume verification succeeds:
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.data?.message || 'Verification failed.');
    }
  };

  const handleResendOtp = async () => {
    try {
      await regenerateOTP({ email: user.email }).unwrap();
    } catch (err) {
      setErrorMsg(err.data?.message || 'Failed to resend OTP.');
    }
  };

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
            An OTP has been sent to <strong>{user.email}</strong>. Please enter
            the OTP below to verify your email.
          </p>

          {(resendError || errorMsg) && (
            <ErrorMsg errorMsg={resendError?.data?.message || errorMsg} />
          )}

          {isResendingOtp ? (
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

const VerifyProfileScreenWithAuth = IsAuth(VerifyProfileScreen);

export default VerifyProfileScreenWithAuth;
