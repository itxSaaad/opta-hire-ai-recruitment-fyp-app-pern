import PropTypes from 'prop-types';
import { memo, useEffect, useRef, useState } from 'react';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

const NavItem = memo(({ item, isActive, onClick }) => {
  return (
    <Link
      to={item.path}
      className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${
        isActive
          ? 'text-light-primary dark:text-dark-primary scale-110'
          : 'text-light-text dark:text-dark-text hover:text-light-primary/80 dark:hover:text-dark-primary/80'
      }`}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
    >
      <div className="mb-1 text-lg">{item.icon}</div>
      <span className="text-xs font-medium">{item.label}</span>
      {isActive && (
        <div className="absolute bottom-0 w-10 h-1.5 bg-light-primary dark:bg-dark-primary rounded-t-md animate-slideUp"></div>
      )}
    </Link>
  );
});

NavItem.displayName = 'NavItem';

const ToggleButton = memo(({ isOpen, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${
        isOpen
          ? 'text-light-primary dark:text-dark-primary scale-110'
          : 'text-light-text dark:text-dark-text hover:text-light-primary/80 dark:hover:text-dark-primary/80'
      }`}
      aria-expanded={isOpen}
      aria-controls="dropup-menu"
    >
      <div className="mb-1 text-lg transition-transform duration-300">
        {isOpen ? (
          <FaAngleDown className="text-xl animate-fadeIn" />
        ) : (
          <FaAngleUp className="text-xl" />
        )}
      </div>
      <span className="text-xs font-medium">More</span>
      {isOpen && (
        <div className="absolute bottom-0 w-10 h-1.5 bg-light-primary dark:bg-dark-primary rounded-t-md animate-slideUp"></div>
      )}
    </button>
  );
});

ToggleButton.displayName = 'ToggleButton';

const BottomNavbar = ({ navItems = [] }) => {
  const location = useLocation();
  const [isDropupOpen, setIsDropupOpen] = useState(false);
  const dropupRef = useRef(null);

  let mainItems = [];
  let dropupItems = [];

  if (navItems.length <= 4) {
    mainItems = navItems;
  } else {
    const firstTwo = navItems.slice(0, 2);
    const defaultThird = navItems[2];
    const dropupCandidates = navItems.slice(2);
    const activeDropupCandidate = dropupCandidates.find(
      (item) => item.path === location.pathname
    );

    if (activeDropupCandidate) {
      mainItems = [
        ...firstTwo,
        activeDropupCandidate,
        { label: 'More', isToggler: true },
      ];
      dropupItems = dropupCandidates.filter(
        (item) => item.path !== activeDropupCandidate.path
      );
    } else {
      mainItems = [
        ...firstTwo,
        defaultThird,
        { label: 'More', isToggler: true },
      ];
      dropupItems = navItems.slice(3);
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropupRef.current && !dropupRef.current.contains(event.target)) {
        setIsDropupOpen(false);
      }
    };

    if (isDropupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropupOpen]);

  useEffect(() => {
    setIsDropupOpen(false);
  }, [location.pathname]);

  const toggleDropup = () => setIsDropupOpen(!isDropupOpen);

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40"
      aria-label="Mobile navigation"
    >
      <div className="relative flex justify-around items-center h-16 bg-light-background dark:bg-dark-background shadow-[0_-2px_10px_rgba(0,0,0,0.1)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.3)] border-t border-light-border dark:border-dark-border">
        {mainItems.map((item, index) => {
          if (item.isToggler) {
            return (
              <ToggleButton
                key={index}
                isOpen={isDropupOpen}
                onClick={toggleDropup}
              />
            );
          } else {
            const isActive = location.pathname === item.path;
            return <NavItem key={index} item={item} isActive={isActive} />;
          }
        })}
      </div>

      {dropupItems.length > 0 && (
        <div
          id="dropup-menu"
          ref={dropupRef}
          className={`absolute left-0 right-0 transform transition-all duration-300 ease-in-out ${
            isDropupOpen
              ? 'translate-y-0 opacity-100'
              : 'translate-y-full opacity-0 pointer-events-none'
          }`}
          style={{ bottom: '64px', zIndex: 50 }}
        >
          <div className="bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-t-lg shadow-lg animate-slideUp">
            <div className="py-2">
              {dropupItems.map((item, idx) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={idx}
                    to={item.path}
                    className={`flex items-center px-4 py-3 transition-all duration-200 ${
                      isActive
                        ? 'text-light-primary dark:text-dark-primary bg-light-surface dark:bg-dark-surface'
                        : 'text-light-text dark:text-dark-text hover:bg-light-surface/50 dark:hover:bg-dark-surface/50'
                    }`}
                    onClick={() => setIsDropupOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className="mr-3 text-lg">{item.icon}</div>
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-light-primary dark:bg-dark-primary animate-fadeIn"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

BottomNavbar.propTypes = {
  navItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      icon: PropTypes.element,
    })
  ),
};

NavItem.propTypes = {
  item: PropTypes.object.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
};

ToggleButton.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default memo(BottomNavbar);
