import { createApi } from '@reduxjs/toolkit/query/react';

import axiosBaseQueryWithReauth from '../../api/axiosBaseQueryWithReauth';

const ENDPOINTS = {
  CONTRACTS: '/contracts',
  CONTRACT_DETAIL: (id) => `/contracts/${id}`,
  CONTRACTS_BY_JOB: (jobId) => `/contracts/job/${jobId}`,
};

export const contractApi = createApi({
  reducerPath: 'contractApi',
  baseQuery: axiosBaseQueryWithReauth,
  tagTypes: ['Contracts'],
  endpoints: (builder) => ({
    getAllContracts: builder.query({
      query: (data) => ({
        url: ENDPOINTS.CONTRACTS,
        method: 'GET',
        params: data,
      }),
      providesTags: ['Contracts'],
    }),
    getContractById: builder.query({
      query: (id) => ({
        url: ENDPOINTS.CONTRACT_DETAIL(id),
        method: 'GET',
      }),
      providesTags: ['Contracts'],
    }),
    getContractsByJobId: builder.query({
      query: (jobId) => ({
        url: ENDPOINTS.CONTRACTS_BY_JOB(jobId),
        method: 'GET',
      }),
      providesTags: ['Contracts'],
    }),
    createContract: builder.mutation({
      query: (contractData) => ({
        url: ENDPOINTS.CONTRACTS,
        method: 'POST',
        data: contractData,
      }),
      invalidatesTags: ['Contracts'],
    }),
    updateContractById: builder.mutation({
      query: ({ id, contractData }) => ({
        url: ENDPOINTS.CONTRACT_DETAIL(id),
        method: 'PUT',
        data: contractData,
      }),
      invalidatesTags: ['Contracts'],
    }),
    deleteContractById: builder.mutation({
      query: (id) => ({
        url: ENDPOINTS.CONTRACT_DETAIL(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Contracts'],
    }),
  }),
});

export const {
  useGetAllContractsQuery,
  useGetContractByIdQuery,
  useGetContractsByJobIdQuery,
  useCreateContractMutation,
  useUpdateContractByIdMutation,
  useDeleteContractByIdMutation,
} = contractApi;
