import { FaTachometerAlt, FaUserShield, FaUsers } from 'react-icons/fa';
import { Outlet, ScrollRestoration } from 'react-router-dom';

import MainContent from '../components/ui/dashboardLayout/MainContent';
import SideBar from '../components/ui/dashboardLayout/SideBar';
import TopNavbar from '../components/ui/dashboardLayout/TopNavbar';

import IsAuth from '../hoc/IsAuth';

const AdminLayout = () => {
  const navItems = [
    {
      label: 'Dashboard',
      icon: <FaTachometerAlt />,
      path: '/admin/dashboard',
    },
    {
      label: 'Users',
      icon: <FaUsers />,
      path: '/admin/users',
    },
    {
      label: 'Roles',
      icon: <FaUserShield />,
      path: '/admin/roles',
    },
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

const ProtectedAdminLayout = IsAuth(AdminLayout);

export default ProtectedAdminLayout;
