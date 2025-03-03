import PropTypes from 'prop-types';

const InputField = ({
  id,
  type,
  label,
  value,
  onChange,
  validationMessage,
}) => (
  <div className="relative w-full">
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      placeholder=""
      className={`w-full p-4 bg-light-background dark:bg-dark-background border ${
        validationMessage
          ? 'border-red-500'
          : 'border-light-border dark:border-dark-border'
      } rounded-lg text-light-text dark:text-dark-text focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary focus:outline-none peer transition-all duration-300`}
      required
    />
    <label
      htmlFor={id}
      className="absolute left-4 top-4 text-light-text dark:text-dark-text text-sm transition-all duration-300 transform -translate-y-1/2 scale-75 origin-top-left peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-4 peer-focus:text-normal peer-focus:text-light-primary dark:peer-focus:text-dark-primary"
    >
      {label}
    </label>
    {validationMessage && (
      <p className="absolute text-red-500 text-sm mt-1">{validationMessage}</p>
    )}
  </div>
);

InputField.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  validationMessage: PropTypes.string,
};

export default InputField;
