import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

const SideBar = ({ navItems = [] }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const location = useLocation();

  const itemsToDisplay = navItems.length > 0 ? navItems : [];

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('sidebarChange', {
        detail: { collapsed },
      })
    );
  }, [collapsed]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsVisible(true);
      else setIsVisible(false);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
    setIsVisible(!isVisible);
  };

  return (
    <>
      {isMobile && (
        <button
          onClick={toggleCollapse}
          aria-label={isVisible ? 'Close sidebar' : 'Open sidebar'}
          className={`fixed bottom-20 left-4 z-50 bg-light-secondary dark:bg-dark-secondary text-dark-text rounded-lg p-3 shadow-lg transition-transform duration-300 ease-in-out transform hover:scale-110 ${isVisible ? 'translate-y-0' : 'translate-y-full'} ${collapsed ? 'rotate-180' : ''}`}
        >
          {isVisible ? (
            <FaTimes className="text-lg" />
          ) : (
            <FaBars className="text-lg" />
          )}
        </button>
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-full bg-light-background dark:bg-dark-background border-r border-light-border dark:border-dark-border transition-all duration-300 ease-in-out flex flex-col md:translate-x-0 ${isVisible ? 'translate-x-0' : '-translate-x-full'} ${collapsed ? 'w-16' : 'w-64'}`}
      >
        <nav className="flex-1 overflow-y-auto p-3 mt-20">
          <ul className="space-y-2">
            {itemsToDisplay.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    onClick={() => {
                      if (!collapsed) toggleCollapse();
                      if (isMobile) setIsVisible(false);
                      window.dispatchEvent(
                        new CustomEvent('sidebarChange', {
                          detail: { collapsed: true },
                        })
                      );
                    }}
                    className={`flex items-center p-2 rounded-lg transition-all duration-200
                        ${
                          isActive
                            ? 'bg-light-primary dark:bg-dark-primary text-white'
                            : 'text-light-text dark:text-dark-text hover:bg-light-surface dark:hover:bg-dark-surface'
                        } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <span
                      className={`${isActive ? '' : 'text-light-text/70 dark:text-dark-text/70'} text-lg`}
                    >
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <span className="ml-3 text-base">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {!isMobile && (
          <div className="p-3 border-t border-light-border dark:border-dark-border">
            <button
              onClick={toggleCollapse}
              className={`flex items-center p-2 rounded-lg w-full text-light-text dark:text-dark-text hover:bg-light-surface dark:hover:bg-dark-surface transition-colors duration-200 ${collapsed ? 'justify-center' : ''}`}
            >
              <FaBars className="text-lg" />
              {!collapsed && (
                <span className="ml-3 text-base">
                  {collapsed ? 'Expand' : 'Collapse'}
                </span>
              )}
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

SideBar.propTypes = {
  navItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      icon: PropTypes.element,
    })
  ),
};

export default SideBar;
