import PropTypes from 'prop-types';

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
      className={`flex items-start p-4 mb-4 rounded-lg ${
        isSuccess
          ? 'text-green-600 dark:text-green-300 bg-green-50 dark:bg-green-900/30'
          : 'text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-900/30'
      }`}
    >
      <p className="text-sm">{message}</p>
    </div>
  );
}

Alert.propTypes = {
  message: PropTypes.string,
  isSuccess: PropTypes.bool,
};
