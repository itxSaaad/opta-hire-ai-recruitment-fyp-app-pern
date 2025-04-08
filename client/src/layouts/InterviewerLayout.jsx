import { Outlet, ScrollRestoration } from 'react-router-dom';

import BottomNavbar from '../components/ui/dashboardLayout/BottomNavbar';
import MainContent from '../components/ui/dashboardLayout/MainContent';
import TopNavbar from '../components/ui/dashboardLayout/TopNavbar';

import IsAuth from '../hoc/IsAuth';

function InterviewerLayout() {
  return (
    <>
      <TopNavbar />
      <MainContent withSidebar={false}>
        <Outlet />
      </MainContent>
      <BottomNavbar />
      <ScrollRestoration />
    </>
  );
}

const ProtectedInterviewerLayout = IsAuth(InterviewerLayout);

export default ProtectedInterviewerLayout;
