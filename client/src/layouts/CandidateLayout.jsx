import { Outlet, ScrollRestoration } from 'react-router-dom';

import Footer from '../components/ui/mainLayout/Footer';
import Navbar from '../components/ui/mainLayout/Navbar';
import IsAuth from '../hoc/isAuth';

function CandidateLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <ScrollRestoration />
      <Footer />
    </>
  );
}

const ProtectedCandidateLayout = IsAuth(CandidateLayout);

export default ProtectedCandidateLayout;
