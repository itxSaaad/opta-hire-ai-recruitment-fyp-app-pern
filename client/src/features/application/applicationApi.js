import { createApi } from '@reduxjs/toolkit/query/react';

import axiosBaseQueryWithReauth from '../../api/axiosBaseQueryWithReauth';

const ENDPOINTS = {
  APPLICATIONS: '/applications',
  APPLICATION_DETAIL: (id) => `/applications/${id}`,
  APPLICATIONS_BY_JOB: (jobId) => `/applications/job/${jobId}`,
};

export const applicationApi = createApi({
  reducerPath: 'applicationApi',
  baseQuery: axiosBaseQueryWithReauth,
  tagTypes: ['Applications'],
  endpoints: (builder) => ({
    getAllApplications: builder.query({
      query: (params = {}) => ({
        url: ENDPOINTS.APPLICATIONS,
        method: 'GET',
        params,
      }),
      providesTags: ['Applications'],
    }),
    getApplicationById: builder.query({
      query: (id) => ({
        url: ENDPOINTS.APPLICATION_DETAIL(id),
        method: 'GET',
      }),
      providesTags: ['Applications'],
    }),
    getApplicationsByJobId: builder.query({
      query: (jobId) => ({
        url: ENDPOINTS.APPLICATIONS_BY_JOB(jobId),
        method: 'GET',
      }),
      providesTags: ['Applications'],
    }),
    createApplication: builder.mutation({
      query: (applicationData) => ({
        url: ENDPOINTS.APPLICATIONS,
        method: 'POST',
        data: applicationData,
      }),
      invalidatesTags: ['Applications'],
    }),
    updateApplication: builder.mutation({
      query: ({ id, applicationData }) => ({
        url: ENDPOINTS.APPLICATION_DETAIL(id),
        method: 'PATCH',
        data: applicationData,
      }),
      invalidatesTags: ['Applications'],
    }),
    deleteApplication: builder.mutation({
      query: (id) => ({
        url: ENDPOINTS.APPLICATION_DETAIL(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Applications'],
    }),
  }),
});

export const {
  useGetAllApplicationsQuery,
  useGetApplicationByIdQuery,
  useGetApplicationsByJobIdQuery,
  useCreateApplicationMutation,
  useUpdateApplicationMutation,
  useDeleteApplicationMutation,
} = applicationApi;
