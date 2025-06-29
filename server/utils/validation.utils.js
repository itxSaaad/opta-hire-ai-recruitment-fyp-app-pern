const { StatusCodes } = require('http-status-codes');

const validateString = (
  res,
  str,
  fieldName,
  minLength = 2,
  maxLength = 500
) => {
  if (!str || typeof str !== 'string') {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(`Please provide a valid ${fieldName.toLowerCase()}.`);
  }
  if (str.length < minLength || str.length > maxLength) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(
      `${fieldName} should be between ${minLength} and ${maxLength} characters. Please adjust and try again.`
    );
  }
  return str.trim();
};

const validateArray = (res, arr, fieldName, minItems = 1, maxItems = 50) => {
  if (!Array.isArray(arr) || arr.length < minItems || arr.length > maxItems) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error(
      `Please provide ${minItems} to ${maxItems} items for ${fieldName.toLowerCase()}.`
    );
  }
  return arr.map((item) => validateString(res, item, `${fieldName} item`));
};

module.exports = {
  validateString,
  validateArray,
};
