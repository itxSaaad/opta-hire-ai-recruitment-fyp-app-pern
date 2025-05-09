import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';

import MainContent from '../components/ui/dashboardLayout/MainContent';
import TopNavbar from '../components/ui/dashboardLayout/TopNavbar';

function InterviewLayout() {
  const location = useLocation();

  const isInterviewRoom = location.pathname.match(/^\/interview\/[^/]+$/);

  return (
    <>
      {!isInterviewRoom && <TopNavbar />}
      <MainContent withSidebar={false}>
        <Outlet />
      </MainContent>
      <ScrollRestoration />
    </>
  );
}

export default InterviewLayout;
