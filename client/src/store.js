import { configureStore } from '@reduxjs/toolkit';

import { applicationApi } from './features/application/applicationApi';
import { authApi } from './features/auth/authApi';
import { chatApi } from './features/chat/chatApi';
import { contractApi } from './features/contract/contractApi';
import { interviewApi } from './features/interview/interviewApi';
import { interviewerRatingApi } from './features/interviewerRating/interviewerRatingApi';
import { jobApi } from './features/job/jobApi';
import { reportApi } from './features/report/reportApi';
import { resumeApi } from './features/resume/resumeApi';
import { transactionApi } from './features/transaction/transactionApi';
import { userApi } from './features/user/userApi';

import authReducer from './features/auth/authSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    [applicationApi.reducerPath]: applicationApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [contractApi.reducerPath]: contractApi.reducer,
    [interviewApi.reducerPath]: interviewApi.reducer,
    [interviewerRatingApi.reducerPath]: interviewerRatingApi.reducer,
    [jobApi.reducerPath]: jobApi.reducer,
    [reportApi.reducerPath]: reportApi.reducer,
    [resumeApi.reducerPath]: resumeApi.reducer,
    [transactionApi.reducerPath]: transactionApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      applicationApi.middleware,
      authApi.middleware,
      chatApi.middleware,
      contractApi.middleware,
      interviewApi.middleware,
      interviewerRatingApi.middleware,
      jobApi.middleware,
      reportApi.middleware,
      resumeApi.middleware,
      transactionApi.middleware,
      userApi.middleware
    ),
  devTools: import.meta.env.NODE_ENV !== 'production',
  // preloadedState: {
  //   auth: {
  //     userInfo: localStorage.getItem('userInfo')
  //       ? JSON.parse(localStorage.getItem('userInfo'))
  //       : null,
  //     accessToken: localStorage.getItem('accessToken')
  //       ? JSON.parse(localStorage.getItem('accessToken'))
  //       : null,
  //     users: [],
  //   },
  // },
  // enhancers: [],
});

export default store;
