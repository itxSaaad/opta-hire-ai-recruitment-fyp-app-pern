import {
  FaPaperPlane,
  FaTachometerAlt,
  FaUserTie,
  FaVideo,
} from 'react-icons/fa';
import { Outlet, ScrollRestoration } from 'react-router-dom';

import BottomNavbar from '../components/ui/dashboardLayout/BottomNavbar';
import MainContent from '../components/ui/dashboardLayout/MainContent';
import TopNavbar from '../components/ui/dashboardLayout/TopNavbar';

import IsAuth from '../hoc/IsAuth';

function CandidateLayout() {
  const navItems = [
    {
      label: 'Dashboard',
      path: '/candidate/dashboard',
      icon: <FaTachometerAlt className="text-xl" />,
    },
    {
      label: 'Jobs',
      path: '/candidate/jobs',
      icon: <FaUserTie className="text-xl" />,
    },
    {
      label: 'Applications',
      path: '/candidate/applications',
      icon: <FaPaperPlane className="text-xl" />,
    },
    {
      label: 'Interviews',
      path: '/candidate/interviews',
      icon: <FaVideo className="text-xl" />,
    },
    {
      label: 'Profile',
      path: '/candidate/profile',
      icon: <FaUserTie className="text-xl" />,
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

const ProtectedCandidateLayout = IsAuth(CandidateLayout);

export default ProtectedCandidateLayout;
