import PropTypes from 'prop-types';

export default function ErrorMsg({
  // errorHeading = 'Error',
  errorMsg = 'An unexpected error occurred.',
}) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex items-start p-4 mb-4 rounded-lg text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-900/30"
    >
      {/* <div className="flex flex-col gap-1"> */}
      {/* <span className="font-medium text-red-800 dark:text-red-200">
          {errorHeading}
        </span> */}
      <p className="text-sm">{errorMsg}</p>
      {/* </div> */}
    </div>
  );
}

ErrorMsg.propTypes = {
  errorHeading: PropTypes.string.isRequired,
  errorMsg: PropTypes.string.isRequired,
};
