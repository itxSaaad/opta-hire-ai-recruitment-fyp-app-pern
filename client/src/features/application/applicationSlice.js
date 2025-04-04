import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedApplication: null,
  applications: [],
};

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    setApplications: (state, action) => {
      state.applications = action.payload;
    },
    setSelectedApplication: (state, action) => {
      state.selectedApplication = action.payload;
    },
    clearSelectedApplication: (state) => {
      state.selectedApplication = null;
    },
    clearApplicationState: (state) => {
      state.applications = [];
      state.selectedApplication = null;
    },
  },
});

export const {
  setApplications,
  setSelectedApplication,
  clearSelectedApplication,
  clearApplicationState,
} = applicationSlice.actions;

export default applicationSlice.reducer;
