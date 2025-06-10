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

function InterviewerLayout() {
  const navItems = [
    {
      label: 'Dashboard',
      path: '/interviewer/dashboard',
      icon: <FaTachometerAlt />,
    },
    {
      label: 'Jobs',
      path: '/interviewer/jobs',
      icon: <FaBriefcase />,
    },
    {
      label: 'Chats',
      path: '/interviewer/chats',
      icon: <FaComments />,
    },
    {
      label: 'Contracts',
      path: '/interviewer/contracts',
      icon: <FaFileContract />,
    },
    {
      label: 'Applications',
      path: '/interviewer/applications',
      icon: <FaEnvelopeOpenText />,
    },
    {
      label: 'Interviews',
      path: '/interviewer/interviews',
      icon: <FaCalendarAlt />,
    },
    {
      label: 'Ratings',
      path: '/interviewer/ratings',
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

export default InterviewerLayout;
