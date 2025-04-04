import { createApi } from '@reduxjs/toolkit/query/react';

import axiosBaseQueryWithReauth from '../../api/axiosBaseQueryWithReauth';

const ENDPOINTS = {
  CHAT_ROOMS: '/chat-rooms',
  CHAT_ROOM_DETAIL: (id) => `/chat-rooms/${id}`,
  CHAT_ROOM_MESSAGES: (id) => `/chat-rooms/${id}/messages`,
};

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: axiosBaseQueryWithReauth,
  tagTypes: ['ChatRooms', 'Messages'],
  endpoints: (builder) => ({
    getAllChatRooms: builder.query({
      query: () => ({
        url: ENDPOINTS.CHAT_ROOMS,
        method: 'GET',
      }),
      providesTags: ['ChatRooms'],
    }),
    getChatRoomById: builder.query({
      query: (id) => ({
        url: ENDPOINTS.CHAT_ROOM_DETAIL(id),
        method: 'GET',
      }),
      providesTags: ['ChatRooms'],
    }),
    getAllMessagesFromChatRoom: builder.query({
      query: (id) => ({
        url: ENDPOINTS.CHAT_ROOM_MESSAGES(id),
        method: 'GET',
      }),
      providesTags: ['Messages'],
    }),
    createChatRoom: builder.mutation({
      query: (chatRoomData) => ({
        url: ENDPOINTS.CHAT_ROOMS,
        method: 'POST',
        data: chatRoomData,
      }),
      invalidatesTags: ['ChatRooms'],
    }),
    deleteChatRoom: builder.mutation({
      query: (id) => ({
        url: ENDPOINTS.CHAT_ROOM_DETAIL(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['ChatRooms'],
    }),
  }),
});

export const {
  useGetAllChatRoomsQuery,
  useGetChatRoomByIdQuery,
  useGetAllMessagesFromChatRoomQuery,
  useCreateChatRoomMutation,
  useDeleteChatRoomMutation,
} = chatApi;
