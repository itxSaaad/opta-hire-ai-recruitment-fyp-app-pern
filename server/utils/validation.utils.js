const validateString = (str, fieldName, minLength = 2, maxLength = 500) => {
  if (!str || typeof str !== 'string') {
    throw new Error(`${fieldName} must be a valid string`);
  }
  if (str.length < minLength || str.length > maxLength) {
    throw new Error(
      `${fieldName} must be between ${minLength} and ${maxLength} characters`
    );
  }
  return str.trim();
};

const validateArray = (arr, fieldName, minItems = 1, maxItems = 50) => {
  if (!Array.isArray(arr) || arr.length < minItems || arr.length > maxItems) {
    throw new Error(
      `${fieldName} must be an array with ${minItems} to ${maxItems} items`
    );
  }
  return arr.map((item) => validateString(item, `${fieldName} item`));
};

module.exports = {
  validateString,
  validateArray,
};
