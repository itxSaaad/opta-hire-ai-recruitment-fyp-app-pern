import { createApi } from '@reduxjs/toolkit/query/react';

import axiosBaseQueryWithReauth from '../../api/axiosBaseQueryWithReauth';

const ENDPOINTS = {
  TRANSACTIONS: '/transactions',
  TRANSACTION_DETAIL: (id) => `/transactions/${id}`,
  TRANSACTIONS_BY_CONTRACT: (contractId) =>
    `/transactions/contract/${contractId}`,
};

export const transactionApi = createApi({
  reducerPath: 'transactionApi',
  baseQuery: axiosBaseQueryWithReauth,
  tagTypes: ['Transactions'],
  endpoints: (builder) => ({
    getAllTransactions: builder.query({
      query: (data) => ({
        url: ENDPOINTS.TRANSACTIONS,
        method: 'GET',
        params: data,
      }),
      providesTags: ['Transactions'],
    }),
    getTransactionById: builder.query({
      query: (id) => ({
        url: ENDPOINTS.TRANSACTION_DETAIL(id),
        method: 'GET',
      }),
      providesTags: ['Transactions'],
    }),
    getTransactionsByContractId: builder.query({
      query: (contractId) => ({
        url: ENDPOINTS.TRANSACTIONS_BY_CONTRACT(contractId),
        method: 'GET',
      }),
      providesTags: ['Transactions'],
    }),
    createTransaction: builder.mutation({
      query: (transactionData) => ({
        url: ENDPOINTS.TRANSACTIONS,
        method: 'POST',
        data: transactionData,
      }),
      invalidatesTags: ['Transactions'],
    }),
    updateTransaction: builder.mutation({
      query: ({ id, transactionData }) => ({
        url: ENDPOINTS.TRANSACTION_DETAIL(id),
        method: 'PUT',
        data: transactionData,
      }),
      invalidatesTags: ['Transactions'],
    }),
    deleteTransaction: builder.mutation({
      query: (id) => ({
        url: ENDPOINTS.TRANSACTION_DETAIL(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Transactions'],
    }),
  }),
});

export const {
  useGetAllTransactionsQuery,
  useGetTransactionByIdQuery,
  useGetTransactionsByContractIdQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
} = transactionApi;
