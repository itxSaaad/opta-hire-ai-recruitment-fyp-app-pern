import PropTypes from 'prop-types';
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

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
  checked,
  min,
  max,
  step,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const sharedClasses = `w-full p-4 bg-light-background dark:bg-dark-background border rounded-lg text-light-text dark:text-dark-text focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary focus:outline-none transition-all duration-300 peer ${
    validationMessage
      ? 'border-red-500'
      : 'border-light-border dark:border-dark-border'
  }`;

  const colorInputClasses = `h-12 cursor-pointer ${sharedClasses}`;

  const rangeInputClasses = `h-2 bg-light-background dark:bg-dark-background appearance-none rounded-lg outline-none opacity-70 transition-opacity duration-200 hover:opacity-100 focus:opacity-100 ${
    validationMessage
      ? 'border-red-500'
      : 'border-light-border dark:border-dark-border'
  }`;

  if (type === 'password') {
    return (
      <div className="relative w-full mb-6">
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
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
          <label
            htmlFor={id}
            className="absolute left-4 top-4 text-light-text dark:text-dark-text text-sm transition-all duration-300 transform -translate-y-1/2 scale-75 origin-top-left peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-4 peer-focus:text-normal peer-focus:text-light-primary dark:peer-focus:text-dark-primary"
          >
            {label}
          </label>
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-light-text dark:text-dark-text"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
        </div>

        {validationMessage && (
          <p id={`${id}-error`} className="absolute mt-1 text-red-500 text-sm">
            {validationMessage}
          </p>
        )}
      </div>
    );
  }

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
      case 'checkbox':
      case 'radio':
        return (
          <div className="flex items-center">
            <input
              type={type}
              id={id}
              checked={checked}
              value={value}
              onChange={onChange}
              className="w-5 h-5 mr-2 text-light-primary dark:text-dark-primary focus:ring-light-primary dark:focus:ring-dark-primary border-light-border dark:border-dark-border rounded"
              aria-invalid={validationMessage ? 'true' : 'false'}
              aria-describedby={validationMessage ? `${id}-error` : undefined}
            />
            <label
              htmlFor={id}
              className="text-light-text dark:text-dark-text text-base"
            >
              {label}
            </label>
          </div>
        );
      case 'file':
        return (
          <div className="relative">
            <input
              type="file"
              id={id}
              onChange={onChange}
              className="sr-only"
              aria-invalid={validationMessage ? 'true' : 'false'}
              aria-describedby={validationMessage ? `${id}-error` : undefined}
            />
            <label
              htmlFor={id}
              className={`flex items-center justify-center cursor-pointer ${sharedClasses}`}
            >
              <span className="text-light-text dark:text-dark-text">
                {value ? value.split('\\').pop() : 'Choose file'}
              </span>
            </label>
          </div>
        );
      case 'color':
        return (
          <input
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            className={colorInputClasses}
            required
            aria-invalid={validationMessage ? 'true' : 'false'}
            aria-describedby={validationMessage ? `${id}-error` : undefined}
          />
        );
      case 'range':
        return (
          <input
            type={type}
            id={id}
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={onChange}
            className={rangeInputClasses}
            required
            aria-invalid={validationMessage ? 'true' : 'false'}
            aria-describedby={validationMessage ? `${id}-error` : undefined}
          />
        );
      default:
        return (
          <input
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            min={min}
            max={max}
            step={step}
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
      {type !== 'checkbox' && type !== 'radio' ? (
        <>
          {renderInput()}
          <label
            htmlFor={id}
            className="absolute left-4 top-4 text-light-text dark:text-dark-text text-sm transition-all duration-300 transform -translate-y-1/2 scale-75 origin-top-left peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-4 peer-focus:text-normal peer-focus:text-light-primary dark:peer-focus:text-dark-primary"
          >
            {label}
          </label>
        </>
      ) : (
        renderInput()
      )}

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
    'text',
    'password',
    'email',
    'number',
    'tel',
    'url',
    'search',
    'date',
    'time',
    'datetime-local',
    'month',
    'week',
    'color',
    'range',
    'file',
    'hidden',
    'checkbox',
    'radio',
    'textarea',
    'select',
  ]).isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
    PropTypes.array,
  ]).isRequired,
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
  checked: PropTypes.bool,
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  step: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default InputField;
