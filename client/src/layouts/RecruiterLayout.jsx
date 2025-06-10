import {
  FaBriefcase,
  FaCalendarAlt,
  FaComments,
  FaEnvelopeOpenText,
  FaFileContract,
  FaStar,
  FaTachometerAlt,
} from 'react-icons/fa';
import { Outlet, ScrollRestoration } from 'react-router-dom';

import BottomNavbar from '../components/ui/dashboardLayout/BottomNavbar';
import MainContent from '../components/ui/dashboardLayout/MainContent';
import TopNavbar from '../components/ui/dashboardLayout/TopNavbar';
import Footer from '../components/ui/mainLayout/Footer';

function RecruiterLayout() {
  const navItems = [
    {
      label: 'Dashboard',
      path: '/recruiter/dashboard',
      icon: <FaTachometerAlt />,
    },
    {
      label: 'Jobs',
      path: '/recruiter/jobs',
      icon: <FaBriefcase />,
    },

    {
      label: 'Chats',
      path: '/recruiter/chats',
      icon: <FaComments />,
    },
    {
      label: 'Contracts',
      path: '/recruiter/contracts',
      icon: <FaFileContract />,
    },
    {
      label: 'Applications',
      path: '/recruiter/applications',
      icon: <FaEnvelopeOpenText />,
    },
    {
      label: 'Interviews',
      path: '/recruiter/interviews',
      icon: <FaCalendarAlt />,
    },
    {
      label: 'Ratings',
      path: '/recruiter/interviewer-ratings',
      icon: <FaStar />,
    },
  ];

  return (
    <>
      <TopNavbar navItems={navItems} />
      <MainContent withSidebar={false}>
        <Outlet />
        <Footer />
      </MainContent>
      <BottomNavbar navItems={navItems} />
      <ScrollRestoration />
    </>
  );
}

export default RecruiterLayout;
