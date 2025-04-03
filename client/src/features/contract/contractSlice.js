import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    contracts: [],
    selectedContract: null,
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
    },
});

export const { setContracts, setSelectedContract, clearSelectedContract } =
    contractSlice.actions;

export default contractSlice.reducer;
