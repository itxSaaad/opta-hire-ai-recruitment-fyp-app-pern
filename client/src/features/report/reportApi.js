import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQueryWithReauth from '../../api/axiosBaseQueryWithReauth';

export const reportApi = createApi({
  reducerPath: 'reportApi',
  baseQuery: axiosBaseQueryWithReauth,
  tagTypes: ['Report'],
  endpoints: (builder) => ({
    getUserActivityReport: builder.query({
      query: ({ startDate, endDate } = {}) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        return {
          url: `/reports/user-activity${params.toString() ? `?${params.toString()}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: ['Report'],
    }),

    getJobPerformanceReport: builder.query({
      query: ({ startDate, endDate } = {}) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        return {
          url: `/reports/job-performance${params.toString() ? `?${params.toString()}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: ['Report'],
    }),

    getFinancialReport: builder.query({
      query: ({ startDate, endDate } = {}) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        return {
          url: `/reports/financial${params.toString() ? `?${params.toString()}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: ['Report'],
    }),

    getInterviewAnalyticsReport: builder.query({
      query: ({ startDate, endDate } = {}) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        return {
          url: `/reports/interview-analytics${params.toString() ? `?${params.toString()}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: ['Report'],
    }),

    getApplicationFunnelReport: builder.query({
      query: ({ startDate, endDate } = {}) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        return {
          url: `/reports/application-funnel${params.toString() ? `?${params.toString()}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: ['Report'],
    }),
  }),
});

export const {
  useLazyGetUserActivityReportQuery,
  useLazyGetJobPerformanceReportQuery,
  useLazyGetFinancialReportQuery,
  useLazyGetInterviewAnalyticsReportQuery,
  useLazyGetApplicationFunnelReportQuery,
} = reportApi;
