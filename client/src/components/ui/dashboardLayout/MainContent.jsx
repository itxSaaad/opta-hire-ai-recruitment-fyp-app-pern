import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';

const MainContent = ({ children, withSidebar = true }) => {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const handleResize = useCallback(() => {
    const mobile = window.innerWidth < 786;
    setIsMobile(mobile);
    setSidebarVisible(!mobile);
  }, []);

  const handleSidebarChange = useCallback((e) => {
    const { detail } = e;
    if (detail) {
      if (typeof detail.collapsed === 'boolean') {
        setCollapsed(detail.collapsed);
      }
      if (typeof detail.isVisible === 'boolean') {
        setSidebarVisible(detail.isVisible);
      }
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    window.addEventListener('sidebarChange', handleSidebarChange);
    return () =>
      window.removeEventListener('sidebarChange', handleSidebarChange);
  }, [handleSidebarChange]);

  return (
    <main
      className={`flex-1 w-full bg-light-background dark:bg-dark-background border-light-border dark:border-dark-border transition-all duration-300 ease-in-out  mx-auto rounded-lg shadow-sm dark:shadow-md ${mounted ? 'animate-slideUp' : 'opacity-0'} ${withSidebar && !isMobile ? (sidebarVisible ? (collapsed ? 'md:ml-24 max-w-[90vw]' : 'md:ml-80 max-w-[70vw]') : 'md:ml-0') : ''}`}
    >
      {children}
    </main>
  );
};

MainContent.propTypes = {
  children: PropTypes.node.isRequired,
  withSidebar: PropTypes.bool,
};

export default MainContent;
