import { createApi } from '@reduxjs/toolkit/query/react';

import axiosBaseQueryWithReauth from '../../api/axiosbaseQueryWithReauth';

const ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  REGENERATE_OTP: '/auth/regenerate-otp',
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: axiosBaseQueryWithReauth,
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: ENDPOINTS.LOGIN,
        method: 'POST',
        data: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    logout: builder.mutation({
      query: () => ({
        url: ENDPOINTS.LOGOUT,
        method: 'POST',
        credentials: 'include',
      }),
      invalidatesTags: ['Auth'],
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: ENDPOINTS.REGISTER,
        method: 'POST',
        data: userData,
      }),
      invalidatesTags: ['Auth'],
    }),
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: ENDPOINTS.FORGOT_PASSWORD,
        method: 'POST',
        data: { email },
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: ENDPOINTS.RESET_PASSWORD,
        method: 'PATCH',
        data: data,
      }),
    }),
    regenerateOTP: builder.mutation({
      query: (email) => ({
        url: ENDPOINTS.REGENERATE_OTP,
        method: 'POST',
        data: { email },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useRegenerateOTPMutation,
} = authApi;
