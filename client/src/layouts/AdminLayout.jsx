import { Outlet, ScrollRestoration } from 'react-router-dom';

import Footer from '../components/ui/mainLayout/Footer';
import Navbar from '../components/ui/mainLayout/Navbar';

import IsAuth from '../hoc/isAuth';

const AdminLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <ScrollRestoration />
      <Footer />
    </>
  );
};

const ProtectedAdminLayout = IsAuth(AdminLayout);
export default ProtectedAdminLayout;
