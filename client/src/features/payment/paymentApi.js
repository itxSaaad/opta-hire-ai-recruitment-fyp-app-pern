import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQueryWithReauth from '../../api/axiosBaseQueryWithReauth';

const ENDPOINTS = {
  CONNECT_ONBOARD: '/payments/connect/onboard',
  CONNECT_STATUS: '/payments/connect/status',
  CONNECT_REFRESH: '/payments/connect/refresh',
  CONNECT_DASHBOARD: '/payments/connect/dashboard',
  CONTRACT_PAY: (contractId) => `/payments/contracts/${contractId}/pay`,
  CONTRACT_CONFIRM: (contractId) => `/payments/contracts/${contractId}/confirm`,
  CONTRACT_COMPLETE: (contractId) =>
    `/payments/contracts/${contractId}/complete`,
  CONTRACT_STATUS: (contractId) => `/payments/contracts/${contractId}/status`,
  CONTRACT_PAYOUT_STATUS: (contractId) =>
    `/payments/contracts/${contractId}/payout-status`,
  PAYOUTS: '/payments/payouts',
};

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: axiosBaseQueryWithReauth,
  tagTypes: ['Payment', 'Contract'],
  endpoints: (builder) => ({
    // Stripe Connect endpoints (for interviewers)
    createStripeConnectAccount: builder.mutation({
      query: () => ({
        url: ENDPOINTS.CONNECT_ONBOARD,
        method: 'POST',
      }),
    }),

    getStripeConnectStatus: builder.query({
      query: () => ({
        url: ENDPOINTS.CONNECT_STATUS,
        method: 'GET',
      }),
      providesTags: ['Payment'],
    }),

    refreshStripeConnectLink: builder.mutation({
      query: () => ({
        url: ENDPOINTS.CONNECT_REFRESH,
        method: 'POST',
      }),
    }),

    getStripeConnectDashboard: builder.query({
      query: () => ({
        url: ENDPOINTS.CONNECT_DASHBOARD,
        method: 'GET',
      }),
      providesTags: ['Payment'],
    }),

    // Contract payment endpoints
    createContractPayment: builder.mutation({
      query: (contractId) => ({
        url: ENDPOINTS.CONTRACT_PAY(contractId),
        method: 'POST',
      }),
      invalidatesTags: ['Contract', 'Payment'],
    }),

    confirmContractPayment: builder.mutation({
      query: ({ contractId, paymentIntentId }) => ({
        url: ENDPOINTS.CONTRACT_CONFIRM(contractId),
        method: 'POST',
        data: { paymentIntentId },
      }),
      invalidatesTags: ['Contract', 'Payment'],
    }),

    completeContractAndPayout: builder.mutation({
      query: (contractId) => ({
        url: ENDPOINTS.CONTRACT_COMPLETE(contractId),
        method: 'POST',
      }),
      invalidatesTags: ['Contract', 'Payment'],
    }),

    getContractPaymentStatus: builder.query({
      query: (contractId) => ({
        url: ENDPOINTS.CONTRACT_STATUS(contractId),
        method: 'GET',
      }),
      providesTags: ['Payment', 'Contract'],
    }),

    getContractPayoutStatus: builder.query({
      query: (contractId) => ({
        url: ENDPOINTS.CONTRACT_PAYOUT_STATUS(contractId),
        method: 'GET',
      }),
      providesTags: ['Payment', 'Contract'],
    }),

    // Payout history
    getPayoutHistory: builder.query({
      query: () => ({
        url: ENDPOINTS.PAYOUTS,
        method: 'GET',
      }),
      providesTags: ['Payment'],
    }),
  }),
});

export const {
  useCreateStripeConnectAccountMutation,
  useGetStripeConnectStatusQuery,
  useRefreshStripeConnectLinkMutation,
  useGetStripeConnectDashboardQuery,
  useCreateContractPaymentMutation,
  useConfirmContractPaymentMutation,
  useCompleteContractAndPayoutMutation,
  useGetContractPaymentStatusQuery,
  useGetContractPayoutStatusQuery,
  useGetPayoutHistoryQuery,
} = paymentApi;
