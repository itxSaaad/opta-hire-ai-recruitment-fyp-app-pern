import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    chatRooms: [],
    selectedChatRoom: null,
    messages: [],
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setChatRooms: (state, action) => {
            state.chatRooms = action.payload;
        },
        setSelectedChatRoom: (state, action) => {
            state.selectedChatRoom = action.payload;
        },
        clearSelectedChatRoom: (state) => {
            state.selectedChatRoom = null;
        },
        setMessages: (state, action) => {
            state.messages = action.payload;
        },
        clearMessages: (state) => {
            state.messages = [];
        },
    },
});

export const { setChatRooms, setSelectedChatRoom, clearSelectedChatRoom, setMessages, clearMessages } =
    chatSlice.actions;

export default chatSlice.reducer;
