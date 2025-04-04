import { configureStore } from '@reduxjs/toolkit';

import { applicationApi } from './features/application/applicationApi';
import { authApi } from './features/auth/authApi';
import { chatApi } from './features/chat/chatApi';
import { contractApi } from './features/contract/contractApi';
import { interviewApi } from './features/interview/interviewApi';
import { interviewerRatingApi } from './features/interviewerRating/interviewerRatingApi';
import { jobApi } from './features/job/jobApi';
import { resumeApi } from './features/resume/resumeApi';
import { transactionApi } from './features/transaction/transactionApi';
import { userApi } from './features/user/userApi';

import applicationReducer from './features/application/applicationSlice';
import authReducer from './features/auth/authSlice';
import chatReducer from './features/chat/chatSlice';
import contractReducer from './features/contract/contractSlice';
import interviewReducer from './features/interview/interviewSlice';
import interviewerRatingReducer from './features/interviewerRating/interviewerRatingSlice';
import jobReducer from './features/job/jobSlice';
import resumeReducer from './features/resume/resumeSlice';
import transactionReducer from './features/transaction/transactionSlice';

const store = configureStore({
  reducer: {
    application: applicationReducer,
    auth: authReducer,
    chat: chatReducer,
    contract: contractReducer,
    interview: interviewReducer,
    interviewerRating: interviewerRatingReducer,
    job: jobReducer,
    resume: resumeReducer,
    transaction: transactionReducer,
    [applicationApi.reducerPath]: applicationApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [contractApi.reducerPath]: contractApi.reducer,
    [interviewApi.reducerPath]: interviewApi.reducer,
    [interviewerRatingApi.reducerPath]: interviewerRatingApi.reducer,
    [jobApi.reducerPath]: jobApi.reducer,
    [resumeApi.reducerPath]: resumeApi.reducer,
    [transactionApi.reducerPath]: transactionApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      applicationApi.middleware,
      chatApi.middleware,
      contractApi.middleware,
      interviewApi.middleware,
      interviewerRatingApi.middleware,
      jobApi.middleware,
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
