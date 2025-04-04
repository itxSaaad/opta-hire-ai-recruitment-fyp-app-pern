import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedTransaction: null,
  transactions: [],
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
    clearTransactionState: (state) => {
      state.transactions = [];
      state.selectedTransaction = null;
    },
  },
});

export const {
  setTransactions,
  setSelectedTransaction,
  clearSelectedTransaction,
  clearTransactionState,
} = transactionSlice.actions;

export default transactionSlice.reducer;
