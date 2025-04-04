import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedContract: null,
  contracts: [],
};

const contractSlice = createSlice({
  name: 'contract',
  initialState,
  reducers: {
    setContracts: (state, action) => {
      state.contracts = action.payload;
    },
    setSelectedContract: (state, action) => {
      state.selectedContract = action.payload;
    },
    clearSelectedContract: (state) => {
      state.selectedContract = null;
    },
    clearContractState: (state) => {
      state.contracts = [];
      state.selectedContract = null;
    },
  },
});

export const {
  setContracts,
  setSelectedContract,
  clearSelectedContract,
  clearContractState,
} = contractSlice.actions;

export default contractSlice.reducer;
