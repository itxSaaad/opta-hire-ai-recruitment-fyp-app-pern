import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    jobs: [],
    selectedJob: null,
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
    },
});

export const { setJobs, setSelectedJob, clearSelectedJob } = jobSlice.actions;
export default jobSlice.reducer;
