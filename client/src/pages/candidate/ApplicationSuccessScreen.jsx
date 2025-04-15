import { Helmet } from 'react-helmet-async';
import { FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function ApplicationSuccess() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Application Successful - OptaHire</title>
        <meta
          name="description"
          content="Your application has been submitted successfully."
        />
      </Helmet>

      <section className="min-h-screen flex items-center justify-center bg-light-background dark:bg-dark-background p-4">
        <div className="bg-light-surface dark:bg-dark-surface p-10 rounded-lg shadow-xl border border-light-border dark:border-dark-border text-center">
          <FaCheckCircle className="text-green-500 mx-auto mb-4" size={64} />
          <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-4">
            Application Successful!
          </h1>
          <p className="text-lg text-light-text dark:text-dark-text mb-8">
            Thank you for applying. We have received your application and will
            be in touch soon.
          </p>
          <button
            onClick={() => navigate('/candidate/dashboard')}
            className="px-6 py-3 bg-light-primary dark:bg-dark-primary text-white rounded-lg hover:bg-light-secondary dark:hover:bg-dark-secondary transition-all duration-300"
          >
            Go to Dashboard
          </button>
        </div>
      </section>
    </>
  );
}
