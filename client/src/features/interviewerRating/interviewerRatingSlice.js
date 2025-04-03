import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    ratings: [],
    selectedRating: null,
};

const interviewerRatingSlice = createSlice({
    name: 'interviewerRating',
    initialState,
    reducers: {
        setRatings: (state, action) => {
            state.ratings = action.payload;
        },
        setSelectedRating: (state, action) => {
            state.selectedRating = action.payload;
        },
        clearSelectedRating: (state) => {
            state.selectedRating = null;
        },
    },
});

export const { setRatings, setSelectedRating, clearSelectedRating } =
    interviewerRatingSlice.actions;

export default interviewerRatingSlice.reducer;
