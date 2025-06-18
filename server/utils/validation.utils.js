const validateString = (str, fieldName, minLength = 2, maxLength = 500) => {
  if (!str || typeof str !== 'string') {
    throw new Error(`Please provide a valid ${fieldName.toLowerCase()}.`);
  }
  if (str.length < minLength || str.length > maxLength) {
    throw new Error(
      `${fieldName} should be between ${minLength} and ${maxLength} characters. Please adjust and try again.`
    );
  }
  return str.trim();
};

const validateArray = (arr, fieldName, minItems = 1, maxItems = 50) => {
  if (!Array.isArray(arr) || arr.length < minItems || arr.length > maxItems) {
    throw new Error(
      `Please provide ${minItems} to ${maxItems} items for ${fieldName.toLowerCase()}.`
    );
  }
  return arr.map((item) => validateString(item, `${fieldName} item`));
};

module.exports = {
  validateString,
  validateArray,
};
