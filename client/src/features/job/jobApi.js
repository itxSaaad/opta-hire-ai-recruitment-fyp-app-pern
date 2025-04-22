import { createApi } from '@reduxjs/toolkit/query/react';

import axiosBaseQueryWithReauth from '../../api/axiosBaseQueryWithReauth';

const ENDPOINTS = {
  JOBS: '/jobs',
  JOB_DETAIL: (id) => `/jobs/${id}`,
};

export const jobApi = createApi({
  reducerPath: 'jobApi',
  baseQuery: axiosBaseQueryWithReauth,
  tagTypes: ['Jobs'],
  endpoints: (builder) => ({
    getAllJobs: builder.query({
      query: (data) => ({
        url: ENDPOINTS.JOBS,
        method: 'GET',
        params: data,
      }),
      providesTags: ['Jobs'],
    }),
    getJobById: builder.query({
      query: (id) => ({
        url: ENDPOINTS.JOB_DETAIL(id),
        method: 'GET',
      }),
      providesTags: ['Jobs'],
    }),
    createJob: builder.mutation({
      query: (jobData) => ({
        url: ENDPOINTS.JOBS,
        method: 'POST',
        data: jobData,
      }),
      invalidatesTags: ['Jobs'],
    }),
    updateJobById: builder.mutation({
      query: ({ id, jobData }) => ({
        url: ENDPOINTS.JOB_DETAIL(id),
        method: 'PATCH',
        data: jobData,
      }),
      invalidatesTags: ['Jobs'],
    }),
    deleteJobById: builder.mutation({
      query: (id) => ({
        url: ENDPOINTS.JOB_DETAIL(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Jobs'],
    }),
  }),
});

export const {
  useGetAllJobsQuery,
  useGetJobByIdQuery,
  useCreateJobMutation,
  useUpdateJobByIdMutation,
  useDeleteJobByIdMutation,
} = jobApi;
