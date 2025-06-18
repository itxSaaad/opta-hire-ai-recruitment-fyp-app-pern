import { createApi } from '@reduxjs/toolkit/query/react';

import axiosBaseQueryWithReauth from '../../api/axiosBaseQueryWithReauth';

const ENDPOINTS = {
  RATINGS: '/interviewer-ratings',
  RATING_DETAIL: (id) => `/interviewer-ratings/${id}`,
  RATINGS_BY_JOB: (jobId) => `/interviewer-ratings/job/${jobId}`,
  RATINGS_BY_CONTRACT: (contractId) =>
    `/interviewer-ratings/contract/${contractId}`,
};

export const interviewerRatingApi = createApi({
  reducerPath: 'interviewerRatingApi',
  baseQuery: axiosBaseQueryWithReauth,
  tagTypes: ['InterviewerRatings'],
  endpoints: (builder) => ({
    getAllRatings: builder.query({
      query: (data) => ({
        url: ENDPOINTS.RATINGS,
        method: 'GET',
        params: data,
      }),
      providesTags: ['InterviewerRatings'],
    }),
    getRatingById: builder.query({
      query: (id) => ({
        url: ENDPOINTS.RATING_DETAIL(id),
        method: 'GET',
      }),
      providesTags: ['InterviewerRatings'],
    }),
    getRatingsByJobId: builder.query({
      query: (jobId) => ({
        url: ENDPOINTS.RATINGS_BY_JOB(jobId),
        method: 'GET',
      }),
      providesTags: ['InterviewerRatings'],
    }),
    getRatingsByContractId: builder.query({
      query: (contractId) => ({
        url: ENDPOINTS.RATINGS_BY_CONTRACT(contractId),
        method: 'GET',
      }),
      providesTags: ['InterviewerRatings'],
    }),
    createRating: builder.mutation({
      query: (ratingData) => ({
        url: ENDPOINTS.RATINGS,
        method: 'POST',
        data: ratingData,
      }),
      invalidatesTags: ['InterviewerRatings'],
    }),
    updateRating: builder.mutation({
      query: ({ id, ratingData }) => ({
        url: ENDPOINTS.RATING_DETAIL(id),
        method: 'PUT',
        data: ratingData,
      }),
      invalidatesTags: ['InterviewerRatings'],
    }),
    deleteRating: builder.mutation({
      query: (id) => ({
        url: ENDPOINTS.RATING_DETAIL(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['InterviewerRatings'],
    }),
  }),
});

export const {
  useGetAllRatingsQuery,
  useGetRatingByIdQuery,
  useGetRatingsByJobIdQuery,
  useGetRatingsByContractIdQuery,
  useCreateRatingMutation,
  useUpdateRatingMutation,
  useDeleteRatingMutation,
} = interviewerRatingApi;
