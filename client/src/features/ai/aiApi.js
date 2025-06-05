import { createApi } from '@reduxjs/toolkit/query/react';

import axiosBaseQueryWithReauth from '../../api/axiosBaseQueryWithReauth';

const ENDPOINTS = {
  HEALTH_SYSTEM: '/ml/health/system',
  HEALTH_AI_SERVICE: '/ml/health/ai-service',
  MODEL_STATUS: '/ml/model/status',
  MODEL_METRICS: '/ml/model/metrics',
  MODEL_TRAIN: '/ml/model/train',
  SHORTLIST_CANDIDATES: (jobId) => `/ml/shortlist/${jobId}`,
  SHORTLIST_PREVIEW: '/ml/shortlist/preview',
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
      query: (trainingParams) => ({
        url: ENDPOINTS.MODEL_TRAIN,
        method: 'POST',
        data: trainingParams,
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
      query: (previewData) => ({
        url: ENDPOINTS.SHORTLIST_PREVIEW,
        method: 'POST',
        data: previewData,
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
