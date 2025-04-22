import { createApi } from '@reduxjs/toolkit/query/react';

import axiosBaseQueryWithReauth from '../../api/axiosBaseQueryWithReauth';

const ENDPOINTS = {
  RESUMES: '/resumes',
  RESUME_DETAIL: (id) => `/resumes/${id}`,
  RESUME_BY_USER_ID: (userId) => `/resumes/user/${userId}`,
  USER_RESUME: '/resumes/user',
};

export const resumeApi = createApi({
  reducerPath: 'resumeApi',
  baseQuery: axiosBaseQueryWithReauth,
  tagTypes: ['Resume'],
  endpoints: (builder) => ({
    getAllResumes: builder.query({
      query: (data) => ({
        url: ENDPOINTS.RESUMES,
        method: 'GET',
        params: data,
      }),
      providesTags: ['Resume'],
    }),
    getResumeForUser: builder.query({
      query: () => ({
        url: ENDPOINTS.USER_RESUME,
        method: 'GET',
      }),
      providesTags: ['Resume'],
    }),
    getResumeByUserId: builder.query({
      query: (userId) => ({
        url: ENDPOINTS.RESUME_BY_USER_ID(userId),
        method: 'GET',
      }),
      providesTags: ['Resume'],
    }),
    createResume: builder.mutation({
      query: (resumeData) => ({
        url: ENDPOINTS.RESUMES,
        method: 'POST',
        data: resumeData,
      }),
      invalidatesTags: ['Resume'],
    }),
    updateResume: builder.mutation({
      query: (resumeData) => ({
        url: ENDPOINTS.USER_RESUME,
        method: 'PUT',
        data: resumeData,
      }),
      invalidatesTags: ['Resume'],
    }),
    deleteResume: builder.mutation({
      query: () => ({
        url: ENDPOINTS.USER_RESUME,
        method: 'DELETE',
      }),
      invalidatesTags: ['Resume'],
    }),
    updateResumeById: builder.mutation({
      query: ({ id, ...data }) => ({
        url: ENDPOINTS.RESUME_DETAIL(id),
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Resume'],
    }),
    deleteResumeById: builder.mutation({
      query: (id) => ({
        url: ENDPOINTS.RESUME_DETAIL(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Resume'],
    }),
  }),
});

export const {
  useCreateResumeMutation,
  useGetAllResumesQuery,
  useGetResumeForUserQuery,
  useGetResumeByUserIdQuery,
  useUpdateResumeMutation,
  useDeleteResumeMutation,
  useUpdateResumeByIdMutation,
  useDeleteResumeByIdMutation,
} = resumeApi;
