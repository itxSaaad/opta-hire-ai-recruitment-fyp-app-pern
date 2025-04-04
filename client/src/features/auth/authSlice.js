import { createSlice } from '@reduxjs/toolkit';

import { clearApplicationState } from '../application/applicationSlice';
import { clearChatState } from '../chat/chatSlice';
import { clearContractState } from '../contract/contractSlice';
import { clearInterviewState } from '../interview/interviewSlice';
import { clearInterviewerRatingState } from '../interviewerRating/interviewerRatingSlice';
import { clearJobState } from '../job/jobSlice';
import { clearResumeState } from '../resume/resumeSlice';
import { clearTransactionState } from '../transaction/transactionSlice';

const initialState = {
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null,
  accessToken: localStorage.getItem('accessToken')
    ? JSON.parse(localStorage.getItem('accessToken'))
    : null,
  users: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateAccessToken: (state, action) => {
      state.accessToken = action.payload;
      localStorage.setItem('accessToken', JSON.stringify(action.payload));
    },
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    logoutUser: (state) => {
      state.userInfo = null;
      state.accessToken = null;
      state.users = [];
      localStorage.removeItem('userInfo');
      localStorage.removeItem('accessToken');
      clearApplicationState(state);
      clearChatState(state);
      clearContractState(state);
      clearInterviewState(state);
      clearInterviewerRatingState(state);
      clearJobState(state);
      clearResumeState(state);
      clearTransactionState(state);
    },
  },
});

export const { updateAccessToken, setUserInfo, logoutUser } = authSlice.actions;

export default authSlice.reducer;
