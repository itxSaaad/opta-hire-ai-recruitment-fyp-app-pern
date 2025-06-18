import { createApi } from '@reduxjs/toolkit/query/react';

import axiosBaseQueryWithReauth from '../../api/axiosBaseQueryWithReauth';

const ENDPOINTS = {
  GET_PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  DELETE_PROFILE: '/users/profile',
  GET_ALL_USERS: '/users',
  GET_USER_BY_ID: (id) => `/users/${id}`,
  UPDATE_USER_BY_ID: (id) => `/users/${id}`,
  DELETE_USER_BY_ID: (id) => `/users/${id}`,
  DELETE_USER_PERMANENT: (id) => `/users/${id}/permanent`,
  VERIFY_EMAIL: '/users/verify-email',
  UPDATE_PASSWORD: '/users/update-password',
};

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: axiosBaseQueryWithReauth,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: (data) => ({
        url: ENDPOINTS.GET_PROFILE,
        method: 'GET',
        params: data,
      }),
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: ENDPOINTS.UPDATE_PROFILE,
        method: 'PUT',
        data: profileData,
      }),
      invalidatesTags: ['User'],
    }),
    deleteProfile: builder.mutation({
      query: () => ({
        url: ENDPOINTS.DELETE_PROFILE,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    getAllUsers: builder.query({
      query: () => ({
        url: ENDPOINTS.GET_ALL_USERS,
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
    getUserById: builder.query({
      query: (id) => ({
        url: ENDPOINTS.GET_USER_BY_ID(id),
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
    updateUserById: builder.mutation({
      query: ({ id, ...profileData }) => ({
        url: ENDPOINTS.UPDATE_USER_BY_ID(id),
        method: 'PUT',
        data: profileData,
      }),
      invalidatesTags: ['User'],
    }),
    deleteUserById: builder.mutation({
      query: (id) => ({
        url: ENDPOINTS.DELETE_USER_BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    deleteUserPermanent: builder.mutation({
      query: (id) => ({
        url: ENDPOINTS.DELETE_USER_PERMANENT(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    verifyEmail: builder.mutation({
      query: (otpData) => ({
        url: ENDPOINTS.VERIFY_EMAIL,
        method: 'POST',
        data: otpData,
      }),
      invalidatesTags: ['User'],
    }),
    updatePassword: builder.mutation({
      query: (data) => ({
        url: ENDPOINTS.UPDATE_PASSWORD,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useDeleteProfileMutation,
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserByIdMutation,
  useDeleteUserByIdMutation,
  useDeleteUserPermanentMutation,
  useVerifyEmailMutation,
  useUpdatePasswordMutation,
} = userApi;
