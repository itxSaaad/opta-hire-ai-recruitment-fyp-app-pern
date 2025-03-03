import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

import { useNavigate } from "react-router-dom";

export default function ForgotPwdScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    navigate("change-password", { replace: true });
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password - OptaHire</title>
        <meta
          name="description"
          content="Reset your OptaHire account password by entering your email."
        />
      </Helmet>
      <section className="min-h-screen flex items-center justify-center py-16 px-4 bg-light-background dark:bg-dark-background">
        <Link
          to="/"
          className="absolute top-4 left-4 text-light-text dark:text-dark-text hover:text-light-primary dark:hover:text-dark-primary transition-all"
        >
          <FaArrowLeft className="inline-block -mt-1 mr-2" /> Back to Home
        </Link>
        <div className="bg-light-background/80 dark:bg-dark-background/80 backdrop-blur-lg rounded-xl shadow-xl p-8 sm:p-10 lg:p-12 max-w-md w-full animate-fadeIn">
          <h2 className="text-3xl font-bold text-center text-light-primary dark:text-dark-primary mb-4">
            Reset Password
          </h2>
          <p className="text-center text-light-text dark:text-dark-text mb-6">
            Enter your email to receive a password reset link.
          </p>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {message && (
            <p className="text-green-500 text-center mb-4">{message}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                className="w-full p-4 bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-lg text-light-text dark:text-dark-text focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary focus:outline-none peer transition-all"
                required
              />
              <label className="absolute left-4 top-4 text-light-text dark:text-dark-text text-sm transition-all transform -translate-y-1/2 scale-75 origin-top-left peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100">
                Email
              </label>
            </div>
            <button
              type="submit"
              className="w-full bg-light-primary dark:bg-dark-primary text-white py-3 rounded-lg font-semibold text-lg hover:bg-light-secondary dark:hover:bg-dark-secondary transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Send Reset Link
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
