import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    applications: [],
    selectedApplication: null,
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
    },
});

export const { setApplications, setSelectedApplication, clearSelectedApplication } =
    applicationSlice.actions;

export default applicationSlice.reducer;
