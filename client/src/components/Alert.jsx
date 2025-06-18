import PropTypes from 'prop-types';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function Alert({
  isSuccess = false,
  message = isSuccess
    ? 'Operation completed successfully.'
    : 'An error occurred. Please try again.',
}) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`mb-4 flex items-start rounded-lg p-4 ${
        isSuccess
          ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300'
          : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      }`}
    >
      {isSuccess ? (
        <FaCheckCircle className="mr-2 h-5 w-5" />
      ) : (
        <FaExclamationTriangle className="mr-2 h-5 w-5" />
      )}

      <p className="text-sm">{message}</p>
    </div>
  );
}

Alert.propTypes = {
  message: PropTypes.string,
  isSuccess: PropTypes.bool,
};
