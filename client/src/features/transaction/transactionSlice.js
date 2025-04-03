import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    transactions: [],
    selectedTransaction: null,
};

const transactionSlice = createSlice({
    name: 'transaction',
    initialState,
    reducers: {
        setTransactions: (state, action) => {
            state.transactions = action.payload;
        },
        setSelectedTransaction: (state, action) => {
            state.selectedTransaction = action.payload;
        },
        clearSelectedTransaction: (state) => {
            state.selectedTransaction = null;
        },
    },
});

export const { setTransactions, setSelectedTransaction, clearSelectedTransaction } =
    transactionSlice.actions;

export default transactionSlice.reducer;
