import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';

const Modal = ({ isOpen, onClose, children, title }) => {
  let modalRoot = document.getElementById('modal-root');

  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);
  }

  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto py-14 px-4">
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative bg-light-surface dark:bg-dark-surface rounded-lg shadow-lg z-10 w-full max-w-lg my-8 mx-auto transform transition-all">
          <div className="flex justify-between items-center p-6 pb-4">
            {title && (
              <h2 className="text-xl font-semibold text-light-text dark:text-dark-text">
                {title}
              </h2>
            )}
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="text-light-text dark:text-dark-text hover:text-light-primary dark:hover:text-dark-primary transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>
          <div className="p-6 pt-0">{children}</div>
        </div>
      </div>
    </div>,
    modalRoot
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
  title: PropTypes.string,
};

export default Modal;
