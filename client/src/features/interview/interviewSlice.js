import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    interviews: [],
    selectedInterview: null,
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
    },
});

export const { setInterviews, setSelectedInterview, clearSelectedInterview } =
    interviewSlice.actions;

export default interviewSlice.reducer;
