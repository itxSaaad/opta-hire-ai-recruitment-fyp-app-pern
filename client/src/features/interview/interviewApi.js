import { createApi } from '@reduxjs/toolkit/query/react';

import axiosBaseQueryWithReauth from '../../api/axiosBaseQueryWithReauth';

const ENDPOINTS = {
  INTERVIEWS: '/interviews',
  INTERVIEW_DETAIL: (id) => `/interviews/${id}`,
  INTERVIEWS_BY_JOB: (jobId) => `/interviews/job/${jobId}`,
};

export const interviewApi = createApi({
  reducerPath: 'interviewApi',
  baseQuery: axiosBaseQueryWithReauth,
  tagTypes: ['Interviews'],
  endpoints: (builder) => ({
    getAllInterviews: builder.query({
      query: (data) => ({
        url: ENDPOINTS.INTERVIEWS,
        method: 'GET',
        params: data,
      }),
      providesTags: ['Interviews'],
    }),
    getInterviewById: builder.query({
      query: (id) => ({
        url: ENDPOINTS.INTERVIEW_DETAIL(id),
        method: 'GET',
      }),
      providesTags: ['Interviews'],
    }),
    getInterviewsByJobId: builder.query({
      query: (jobId) => ({
        url: ENDPOINTS.INTERVIEWS_BY_JOB(jobId),
        method: 'GET',
      }),
      providesTags: ['Interviews'],
    }),
    createInterview: builder.mutation({
      query: (interviewData) => ({
        url: ENDPOINTS.INTERVIEWS,
        method: 'POST',
        data: interviewData,
      }),
      invalidatesTags: ['Interviews'],
    }),
    updateInterview: builder.mutation({
      query: ({ id, interviewData }) => ({
        url: ENDPOINTS.INTERVIEW_DETAIL(id),
        method: 'PUT',
        data: interviewData,
      }),
      invalidatesTags: ['Interviews'],
    }),
    deleteInterview: builder.mutation({
      query: (id) => ({
        url: ENDPOINTS.INTERVIEW_DETAIL(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Interviews'],
    }),
  }),
});

export const {
  useGetAllInterviewsQuery,
  useGetInterviewByIdQuery,
  useGetInterviewsByJobIdQuery,
  useCreateInterviewMutation,
  useUpdateInterviewMutation,
  useDeleteInterviewMutation,
} = interviewApi;
