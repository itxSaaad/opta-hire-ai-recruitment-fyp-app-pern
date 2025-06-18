export const getExpectedRoute = (user) => {
  if (user.isAdmin) return '/admin/dashboard';
  if (user.isRecruiter) return '/recruiter/dashboard';
  if (user.isInterviewer) return '/interviewer/dashboard';
  if (user.isCandidate) return '/candidate/dashboard';
  return '/';
};

export const getUserRole = (user) => {
  if (user.isAdmin) return 'admin';
  if (user.isRecruiter) return 'recruiter';
  if (user.isInterviewer) return 'interviewer';
  if (user.isCandidate) return 'candidate';
  return 'user';
};
