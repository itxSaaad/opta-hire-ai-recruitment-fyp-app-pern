import {
  FaBriefcase,
  FaCalendarAlt,
  FaComments,
  FaEnvelopeOpenText,
  FaFileContract,
  FaTachometerAlt,
  FaUserTie,
} from 'react-icons/fa';
import { Outlet, ScrollRestoration } from 'react-router-dom';

import BottomNavbar from '../components/ui/dashboardLayout/BottomNavbar';
import MainContent from '../components/ui/dashboardLayout/MainContent';
import TopNavbar from '../components/ui/dashboardLayout/TopNavbar';

import IsAuth from '../hoc/IsAuth';

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
      label: 'Interviewers',
      path: '/recruiter/interviewers',
      icon: <FaUserTie />,
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
  ];

  return (
    <>
      <TopNavbar navItems={navItems} />
      <MainContent withSidebar={false}>
        <Outlet />
      </MainContent>
      <BottomNavbar navItems={navItems} />
      <ScrollRestoration />
    </>
  );
}

const ProtectedRecruiterLayout = IsAuth(RecruiterLayout, ['recruiter']);

export default ProtectedRecruiterLayout;
