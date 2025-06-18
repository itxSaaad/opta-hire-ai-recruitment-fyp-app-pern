import { createSlice } from '@reduxjs/toolkit';

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
    },
  },
});

export const { updateAccessToken, setUserInfo, logoutUser } = authSlice.actions;

export default authSlice.reducer;
