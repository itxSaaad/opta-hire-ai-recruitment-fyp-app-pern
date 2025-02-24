import { Outlet, ScrollRestoration } from 'react-router-dom';

import Footer from '../components/ui/mainLayout/Footer';
import Navbar from '../components/ui/mainLayout/Navbar';

export default function CandidateLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <ScrollRestoration />
      <Footer />
    </>
  );
}
