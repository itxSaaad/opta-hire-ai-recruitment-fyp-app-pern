import { Outlet, ScrollRestoration } from 'react-router-dom';

import Footer from '../components/ui/mainLayout/Footer';
import Navbar from '../components/ui/mainLayout/Navbar';

import IsAuth from '../hoc/isAuth';

function RecruiterLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <ScrollRestoration />
      <Footer />
    </>
  );
}

const ProtectedRecruiterLayout = IsAuth(RecruiterLayout);

export default ProtectedRecruiterLayout;
