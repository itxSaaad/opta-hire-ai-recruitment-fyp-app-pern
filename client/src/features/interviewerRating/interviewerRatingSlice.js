import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedRating: null,
  ratings: [],
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
    clearInterviewerRatingState: (state) => {
      state.ratings = [];
      state.selectedRating = null;
    },
  },
});

export const {
  setRatings,
  setSelectedRating,
  clearSelectedRating,
  clearInterviewerRatingState,
} = interviewerRatingSlice.actions;

export default interviewerRatingSlice.reducer;
