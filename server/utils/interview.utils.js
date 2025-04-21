const generateRoomId = (length = 12) => {
  const timestamp = Date.now().toString(36);
  const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomPart = Array.from({ length: 6 }, () =>
    randomChars.charAt(Math.floor(Math.random() * randomChars.length))
  ).join('');

  return `${timestamp.slice(-4)}-${randomPart.slice(0, 4)}-${randomPart.slice(
    4
  )}`;
};

const generateRemarks = (status, interviewer, candidate, jobTitle) => {
  const currentTime = new Date().toLocaleString();

  switch (status) {
    case 'scheduled':
      return `Interview for ${jobTitle} position has been successfully scheduled. ${interviewer} will interview ${candidate}. Waiting for participants to join.`;
    case 'ongoing':
      return `Interview in progress since ${currentTime}. ${interviewer} is interviewing ${candidate} for the ${jobTitle} position.`;
    case 'completed':
      return `Interview successfully completed at ${currentTime}. ${candidate}'s interview for ${jobTitle} position with ${interviewer} has concluded.`;
    case 'cancelled':
      return `Interview for ${jobTitle} position has been cancelled at ${currentTime}. ${interviewer} and ${candidate} have been notified.`;
    default:
      return 'Unable to determine interview status. Please contact support.';
  }
};

const formatResponse = (success, message, data = {}) => {
  return {
    success,
    message,
    timestamp: new Date().toISOString(),
    ...data,
  };
};

module.exports = {
  generateRoomId,
  generateRemarks,
  formatResponse,
};
