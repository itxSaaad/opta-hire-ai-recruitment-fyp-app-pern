import { Outlet, ScrollRestoration } from 'react-router-dom';

import MainContent from '../components/ui/dashboardLayout/MainContent';
// import TopNavbar from '../components/ui/dashboardLayout/TopNavbar';

import IsAuth from '../hoc/IsAuth';

function InterviewLayout() {
  return (
    <>
      {/* <TopNavbar /> */}
      <MainContent withSidebar={false}>
        <Outlet />
      </MainContent>
      <ScrollRestoration />
    </>
  );
}

const ProtectedInterviewLayout = IsAuth(InterviewLayout, [
  'candidate',
  'interviewer',
]);

export default ProtectedInterviewLayout;
