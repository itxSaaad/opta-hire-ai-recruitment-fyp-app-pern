import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';

const MainContent = ({ children, withSidebar = true }) => {
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const handleResize = useCallback(() => {
    const mobile = window.innerWidth < 768;
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
      className={`mx-auto w-full flex-1 rounded-lg border-light-border bg-light-background shadow-sm transition-all duration-300 ease-in-out dark:border-dark-border dark:bg-dark-background dark:shadow-md ${
        mounted ? 'animate-slideUp' : 'opacity-0'
      } ${
        withSidebar
          ? sidebarVisible
            ? collapsed
              ? 'md:ml-16 md:w-[calc(100%-4rem)]'
              : 'md:ml-64 md:w-[calc(100%-16rem)]'
            : 'md:w-full'
          : 'w-full'
      }`}
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
