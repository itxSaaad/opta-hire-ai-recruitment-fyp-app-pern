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
  if (password.length < 6) return 'Password must be at least 6 characters';
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

const validateTitle = (title) => {
  if (!title) return 'Title is required.';
  if (title.length < 2 || title.length > 100)
    return 'Title must be between 2 and 100 characters.';
  return '';
};

const validateSummary = (summary) => {
  if (!summary) return 'Summary is required.';
  if (summary.length < 50 || summary.length > 500)
    return 'Summary must be between 50 and 500 characters.';
  return '';
};

const validateHeadline = (headline) => {
  if (!headline) return 'Headline is required.';
  if (headline.length < 10 || headline.length > 150)
    return 'Headline must be between 10 and 150 characters.';
  return '';
};

const validateSkills = (skills) => {
  if (!skills || !Array.isArray(skills)) return 'Skills must be an array.';
  if (skills.length < 1) return 'At least one skill is required.';
  if (skills.length > 20) return 'Maximum 20 skills allowed.';
  return '';
};

const validateExperience = (experience) => {
  if (!experience) return 'Experience details are required.';
  return '';
};

const validateEducation = (education) => {
  if (!education) return 'Education details are required.';
  return '';
};

const validateIndustry = (industry) => {
  if (!industry) return 'Industry is required.';
  if (industry.length < 2 || industry.length > 50)
    return 'Industry must be between 2 and 50 characters.';
  return '';
};

const validateAvailability = (availability) => {
  const validOptions = [
    'Immediate',
    'Two weeks',
    'One month',
    'More than a month',
  ];
  if (!availability) return 'Availability status is required.';
  if (!validOptions.includes(availability))
    return 'Invalid availability status.';
  return '';
};

const validateCompany = (company) => {
  if (!company) return 'Company name is required.';
  if (company.length < 2 || company.length > 100)
    return 'Company name must be between 2 and 100 characters.';
  return '';
};

const validateAchievements = (achievements) => {
  if (achievements && achievements.length > 1000)
    return 'Achievements must not exceed 1000 characters.';
  return '';
};

const validateRating = (rating) => {
  if (rating === null || rating === undefined) return '';
  const numRating = parseFloat(rating);
  if (isNaN(numRating)) return 'Rating must be a number.';
  if (numRating < 0) return 'Rating cannot be less than 0.';
  if (numRating > 5) return 'Rating cannot be more than 5.';
  return '';
};

const validatePortfolio = (portfolio) => {
  if (!portfolio) return '';
  try {
    new URL(portfolio);
    return '';
  } catch {
    return 'Invalid URL format.';
  }
};

export {
  validateConfirmPassword,
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
  validateTitle,
  validateSummary,
  validateHeadline,
  validateSkills,
  validateExperience,
  validateEducation,
  validateIndustry,
  validateAvailability,
  validateCompany,
  validateAchievements,
  validateRating,
  validatePortfolio,
};
