import { createApi } from '@reduxjs/toolkit/query/react';

import axiosBaseQueryWithReauth from '../../api/axiosBaseQueryWithReauth';

const ENDPOINTS = {
  HEALTH_SYSTEM: '/ai/health/system',
  HEALTH_AI_SERVICE: '/ai/health/ai-service',
  MODEL_STATUS: '/ai/model/status',
  MODEL_METRICS: '/ai/model/metrics',
  MODEL_TRAIN: '/ai/model/train',
  SHORTLIST_CANDIDATES: (jobId) => `/ai/shortlist/${jobId}`,
  SHORTLIST_PREVIEW: '/ai/shortlist/preview',
};

export const aiApi = createApi({
  reducerPath: 'aiApi',
  baseQuery: axiosBaseQueryWithReauth,
  tagTypes: ['AIModel', 'AIHealth', 'Shortlist'],
  endpoints: (builder) => ({
    checkSystemHealth: builder.query({
      query: () => ({
        url: ENDPOINTS.HEALTH_SYSTEM,
        method: 'GET',
      }),
      providesTags: ['AIHealth'],
    }),
    checkAiServiceStatus: builder.query({
      query: () => ({
        url: ENDPOINTS.HEALTH_AI_SERVICE,
        method: 'GET',
      }),
      providesTags: ['AIHealth'],
    }),
    getModelStatus: builder.query({
      query: () => ({
        url: ENDPOINTS.MODEL_STATUS,
        method: 'GET',
      }),
      providesTags: ['AIModel'],
    }),
    getModelMetrics: builder.query({
      query: () => ({
        url: ENDPOINTS.MODEL_METRICS,
        method: 'GET',
      }),
      providesTags: ['AIModel'],
    }),
    trainModel: builder.mutation({
      query: ({ useHistoricalData, trainingSize }) => ({
        url: ENDPOINTS.MODEL_TRAIN,
        method: 'POST',
        data: { useHistoricalData, trainingSize },
      }),
      invalidatesTags: ['AIModel'],
    }),
    shortlistCandidates: builder.mutation({
      query: (jobId) => ({
        url: ENDPOINTS.SHORTLIST_CANDIDATES(jobId),
        method: 'POST',
      }),
      invalidatesTags: ['Shortlist'],
    }),
    previewCandidateShortlist: builder.mutation({
      query: ({ jobId }) => ({
        url: ENDPOINTS.SHORTLIST_PREVIEW,
        method: 'POST',
        data: { jobId },
      }),
    }),
  }),
});

export const {
  useCheckSystemHealthQuery,
  useCheckAiServiceStatusQuery,
  useGetModelStatusQuery,
  useGetModelMetricsQuery,
  useTrainModelMutation,
  useShortlistCandidatesMutation,
  usePreviewCandidateShortlistMutation,
} = aiApi;
