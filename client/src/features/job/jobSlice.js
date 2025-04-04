import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedJob: null,
  jobs: [],
};

const jobSlice = createSlice({
  name: 'job',
  initialState,
  reducers: {
    setJobs: (state, action) => {
      state.jobs = action.payload;
    },
    setSelectedJob: (state, action) => {
      state.selectedJob = action.payload;
    },
    clearSelectedJob: (state) => {
      state.selectedJob = null;
    },
    clearJobState: (state) => {
      state.jobs = [];
      state.selectedJob = null;
    },
  },
});

export const { setJobs, setSelectedJob, clearSelectedJob, clearJobState } =
  jobSlice.actions;

export default jobSlice.reducer;
