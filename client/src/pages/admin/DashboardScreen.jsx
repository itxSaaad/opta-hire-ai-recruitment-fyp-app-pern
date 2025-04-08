import { Helmet } from 'react-helmet-async';

import Logo from '../../assets/images/logo.png';

export default function DashboardScreen() {
  return (
    <>
      <Helmet>
        <title>Admin Dashboard - OptaHire</title>
        <meta
          name="description"
          content="OptaHire Admin Dashboard - Manage your recruitment process efficiently with our powerful tools and insights."
        />
        <meta
          name="keywords"
          content="OptaHire, Admin Dashboard, Recruitment, Management"
        />
      </Helmet>

      <section className="min-h-screen flex items-center justify-center py-24 px-4 bg-light-background dark:bg-dark-background animate-fadeIn">
        <div className="max-w-4xl w-full mx-auto text-center bg-light-surface dark:bg-dark-surface p-8 rounded-xl shadow-lg animate-slideUp">
          <img
            src={Logo}
            alt="OptaHire Logo"
            className="w-24 h-24 mx-auto mb-6"
          />
          <h1 className="text-4xl font-bold text-light-text dark:text-dark-text mb-6">
            Welcome to the Admin Dashboard
          </h1>
          <p className="text-xl text-light-text dark:text-dark-text mb-8">
            Manage your recruitment process efficiently with our powerful tools
            and insights.
          </p>
          <div className="border-t border-light-border dark:border-dark-border pt-6 mt-6">
            <p className="text-lg text-light-text dark:text-dark-text mb-6">
              Please select an option from the menu to get started.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
