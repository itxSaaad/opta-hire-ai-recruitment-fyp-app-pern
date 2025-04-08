import {
  FaCalendarAlt,
  FaClipboardList,
  FaComments,
  FaFileContract,
  FaTachometerAlt,
} from 'react-icons/fa';
import { Outlet, ScrollRestoration } from 'react-router-dom';

import BottomNavbar from '../components/ui/dashboardLayout/BottomNavbar';
import MainContent from '../components/ui/dashboardLayout/MainContent';
import TopNavbar from '../components/ui/dashboardLayout/TopNavbar';

import IsAuth from '../hoc/IsAuth';

function InterviewerLayout() {
  const navItems = [
    {
      label: 'Dashboard',
      path: '/interviewer/dashboard',
      icon: <FaTachometerAlt />,
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
      label: 'Interviews',
      path: '/interviewer/interviews',
      icon: <FaCalendarAlt />,
    },
    {
      label: 'Feedback',
      path: '/interviewer/feedback',
      icon: <FaClipboardList />,
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

const ProtectedInterviewerLayout = IsAuth(InterviewerLayout, ['interviewer']);

export default ProtectedInterviewerLayout;
