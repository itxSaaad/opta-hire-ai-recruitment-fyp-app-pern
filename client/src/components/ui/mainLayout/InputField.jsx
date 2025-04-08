import PropTypes from 'prop-types';

const InputField = ({
  id,
  type,
  label,
  value,
  onChange,
  validationMessage,
  onKeyDown,
  rows,
  options,
}) => {
  const sharedClasses = `w-full p-4 bg-light-background dark:bg-dark-background border rounded-lg text-light-text dark:text-dark-text focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary focus:outline-none transition-all duration-300 peer ${
    validationMessage
      ? 'border-red-500'
      : 'border-light-border dark:border-dark-border'
  }`;

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={id}
            value={value}
            onChange={onChange}
            placeholder=""
            rows={rows || 4}
            className={sharedClasses}
            required
            aria-invalid={validationMessage ? 'true' : 'false'}
            aria-describedby={validationMessage ? `${id}-error` : undefined}
          />
        );
      case 'select':
        return (
          <select
            id={id}
            value={value}
            onChange={onChange}
            className={sharedClasses}
            required
            aria-invalid={validationMessage ? 'true' : 'false'}
            aria-describedby={validationMessage ? `${id}-error` : undefined}
          >
            <option value="" disabled hidden></option>
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            placeholder=""
            className={sharedClasses}
            required
            aria-invalid={validationMessage ? 'true' : 'false'}
            aria-describedby={validationMessage ? `${id}-error` : undefined}
          />
        );
    }
  };

  return (
    <div className="relative w-full mb-6">
      {renderInput()}

      <label
        htmlFor={id}
        className="absolute left-4 top-4 text-light-text dark:text-dark-text text-sm transition-all duration-300 transform -translate-y-1/2 scale-75 origin-top-left peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-4 peer-focus:text-normal peer-focus:text-light-primary dark:peer-focus:text-dark-primary"
      >
        {label}
      </label>

      {validationMessage && (
        <p id={`${id}-error`} className="absolute mt-1 text-red-500 text-sm">
          {validationMessage}
        </p>
      )}
    </div>
  );
};

InputField.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.oneOf([
    'number',
    'email',
    'text',
    'textarea',
    'select',
    'password',
  ]).isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  validationMessage: PropTypes.string,
  onKeyDown: PropTypes.func,
  rows: PropTypes.number,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
};

export default InputField;
