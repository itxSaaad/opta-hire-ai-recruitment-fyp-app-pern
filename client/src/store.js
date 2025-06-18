import { configureStore } from '@reduxjs/toolkit';

import { aiApi } from './features/ai/aiApi';
import { applicationApi } from './features/application/applicationApi';
import { authApi } from './features/auth/authApi';
import { chatApi } from './features/chat/chatApi';
import { contractApi } from './features/contract/contractApi';
import { interviewApi } from './features/interview/interviewApi';
import { interviewerRatingApi } from './features/interviewerRating/interviewerRatingApi';
import { jobApi } from './features/job/jobApi';
import { paymentApi } from './features/payment/paymentApi';
import { reportApi } from './features/report/reportApi';
import { resumeApi } from './features/resume/resumeApi';
import { transactionApi } from './features/transaction/transactionApi';
import { userApi } from './features/user/userApi';

import authReducer, { logoutUser } from './features/auth/authSlice';

const store = configureStore({
  reducer: {
    [aiApi.reducerPath]: aiApi.reducer,
    [applicationApi.reducerPath]: applicationApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [contractApi.reducerPath]: contractApi.reducer,
    [interviewApi.reducerPath]: interviewApi.reducer,
    [interviewerRatingApi.reducerPath]: interviewerRatingApi.reducer,
    [jobApi.reducerPath]: jobApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [reportApi.reducerPath]: reportApi.reducer,
    [resumeApi.reducerPath]: resumeApi.reducer,
    [transactionApi.reducerPath]: transactionApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      aiApi.middleware,
      applicationApi.middleware,
      authApi.middleware,
      chatApi.middleware,
      contractApi.middleware,
      interviewApi.middleware,
      interviewerRatingApi.middleware,
      jobApi.middleware,
      paymentApi.middleware,
      reportApi.middleware,
      resumeApi.middleware,
      transactionApi.middleware,
      userApi.middleware,
      (store) => (next) => (action) => {
        const result = next(action);

        if (action.type === logoutUser.type) {
          store.dispatch(aiApi.util.resetApiState());
          store.dispatch(applicationApi.util.resetApiState());
          store.dispatch(authApi.util.resetApiState());
          store.dispatch(chatApi.util.resetApiState());
          store.dispatch(contractApi.util.resetApiState());
          store.dispatch(interviewApi.util.resetApiState());
          store.dispatch(interviewerRatingApi.util.resetApiState());
          store.dispatch(jobApi.util.resetApiState());
          store.dispatch(paymentApi.util.resetApiState());
          store.dispatch(reportApi.util.resetApiState());
          store.dispatch(resumeApi.util.resetApiState());
          store.dispatch(transactionApi.util.resetApiState());
          store.dispatch(userApi.util.resetApiState());
        }

        return result;
      }
    ),
  devTools: import.meta.env.NODE_ENV !== 'production',
});

export default store;
