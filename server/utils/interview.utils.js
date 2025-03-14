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
      return `Interview scheduled between ${interviewer} (Interviewer) and ${candidate} for ${jobTitle} position. Awaiting both parties to join.`;
    case 'ongoing':
      return `Interview in progress since ${currentTime}. ${interviewer} is currently interviewing ${candidate} for ${jobTitle} role.`;
    case 'completed':
      return `Interview successfully concluded at ${currentTime}. ${candidate} was interviewed by ${interviewer} for ${jobTitle} position.`;
    case 'cancelled':
      return `Interview for ${jobTitle} position between ${interviewer} and ${candidate} has been cancelled at ${currentTime}.`;
    default:
      return 'Interview status not specified';
  }
};

module.exports = { generateRoomId, generateRemarks };
