import PropTypes from 'prop-types';

export default function ErrorMsg({
  errorMsg = 'An unexpected error occurred.',
}) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex items-start p-4 mb-4 rounded-lg text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-900/30"
    >
      <p className="text-sm">{errorMsg}</p>
    </div>
  );
}

ErrorMsg.propTypes = {
  errorMsg: PropTypes.string,
};
