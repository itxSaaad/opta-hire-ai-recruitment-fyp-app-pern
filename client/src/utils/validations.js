const validateName = (name) => {
  if (!name) return 'This field is required.';
  if (name.length < 2) return 'Must be at least 2 characters.';
  return '';
};

const validatePhone = (phone) => {
  const phoneRegex = /^[+][0-9]{1,2}[0-9]{9,10}$/;
  if (!phone) return 'Phone number is required';
  if (!phoneRegex.test(phone)) return 'Invalid phone number format';
  return '';
};

const validateEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!email) return 'This field is required.';
  if (!regex.test(email)) return 'Enter a valid email address.';
  return '';
};

const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password))
    return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password))
    return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password))
    return 'Password must contain at least one number';
  if (!/[!@#$%^&*]/.test(password))
    return 'Password must contain at least one special character';
  return '';
};

const validateConfirmPassword = (confirmPassword, password) => {
  if (!confirmPassword) return 'This field is required.';
  if (confirmPassword !== password) return 'Passwords must match.';
  return '';
};

export {
  validateConfirmPassword,
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
};
