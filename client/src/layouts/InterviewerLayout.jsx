import { Outlet, ScrollRestoration } from 'react-router-dom';

import Footer from '../components/ui/mainLayout/Footer';
import Navbar from '../components/ui/mainLayout/Navbar';

import IsAuth from '../hoc/IsAuth';

function InterviewerLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <ScrollRestoration />
      <Footer />
    </>
  );
}

const ProtectedInterviewerLayout = IsAuth(InterviewerLayout);

export default ProtectedInterviewerLayout;
