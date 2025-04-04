import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedInterview: null,
  interviews: [],
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setInterviews: (state, action) => {
      state.interviews = action.payload;
    },
    setSelectedInterview: (state, action) => {
      state.selectedInterview = action.payload;
    },
    clearSelectedInterview: (state) => {
      state.selectedInterview = null;
    },
    clearInterviewState: (state) => {
      state.interviews = [];
      state.selectedInterview = null;
    },
  },
});

export const {
  setInterviews,
  setSelectedInterview,
  clearSelectedInterview,
  clearInterviewState,
} = interviewSlice.actions;

export default interviewSlice.reducer;
