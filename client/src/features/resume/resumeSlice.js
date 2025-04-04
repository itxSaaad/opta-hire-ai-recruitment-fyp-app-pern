import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  resume: null,
  resumes: [],
};

const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    setResume: (state, action) => {
      state.resume = action.payload;
    },
    setResumes: (state, action) => {
      state.resumes = action.payload;
    },
    clearResumeState: (state) => {
      state.resume = null;
      state.resumes = [];
    },
  },
});

export const { setResume, setResumes, clearResumeState } = resumeSlice.actions;

export default resumeSlice.reducer;
