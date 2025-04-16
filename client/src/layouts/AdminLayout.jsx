import {
  FaBriefcase,
  FaCalendarAlt,
  FaChartBar,
  FaDollarSign,
  FaEnvelopeOpenText,
  FaFileContract,
  FaStar,
  FaTachometerAlt,
  FaUsers,
} from 'react-icons/fa';
import { Outlet, ScrollRestoration } from 'react-router-dom';

import MainContent from '../components/ui/dashboardLayout/MainContent';
import SideBar from '../components/ui/dashboardLayout/SideBar';
import TopNavbar from '../components/ui/dashboardLayout/TopNavbar';

import IsAuth from '../hoc/IsAuth';

const AdminLayout = () => {
  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <FaTachometerAlt /> },
    { label: 'Users', path: '/admin/users', icon: <FaUsers /> },
    { label: 'Jobs', path: '/admin/jobs', icon: <FaBriefcase /> },
    {
      label: 'Applications',
      path: '/admin/applications',
      icon: <FaEnvelopeOpenText />,
    },
    { label: 'Contracts', path: '/admin/contracts', icon: <FaFileContract /> },
    { label: 'Interviews', path: '/admin/interviews', icon: <FaCalendarAlt /> },
    {
      label: 'Transactions',
      path: '/admin/transactions',
      icon: <FaDollarSign />,
    },
    {
      label: 'Interviewer Ratings',
      path: '/admin/interviewer-ratings',
      icon: <FaStar />,
    },
    { label: 'Reports', path: '/admin/reports', icon: <FaChartBar /> },
  ];

  return (
    <>
      <TopNavbar />
      <SideBar navItems={navItems} />
      <MainContent withSidebar={true}>
        <Outlet />
      </MainContent>
      <ScrollRestoration />
    </>
  );
};

const ProtectedAdminLayout = IsAuth(AdminLayout, ['admin']);

export default ProtectedAdminLayout;
