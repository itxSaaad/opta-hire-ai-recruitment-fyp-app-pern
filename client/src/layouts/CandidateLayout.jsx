import {
  FaBriefcase,
  FaCalendarAlt,
  FaEnvelope,
  FaTachometerAlt,
} from 'react-icons/fa';
import { Outlet, ScrollRestoration } from 'react-router-dom';

import BottomNavbar from '../components/ui/dashboardLayout/BottomNavbar';
import MainContent from '../components/ui/dashboardLayout/MainContent';
import TopNavbar from '../components/ui/dashboardLayout/TopNavbar';
import Footer from '../components/ui/mainLayout/Footer';

function CandidateLayout() {
  const navItems = [
    {
      label: 'Dashboard',
      path: '/candidate/dashboard',
      icon: <FaTachometerAlt />,
    },
    { label: 'Jobs', path: '/candidate/jobs', icon: <FaBriefcase /> },
    {
      label: 'Applications',
      path: '/candidate/applications',
      icon: <FaEnvelope />,
    },
    {
      label: 'Interviews',
      path: '/candidate/interviews',
      icon: <FaCalendarAlt />,
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

export default CandidateLayout;
