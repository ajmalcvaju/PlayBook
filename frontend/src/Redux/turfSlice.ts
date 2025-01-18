import { createSlice} from "@reduxjs/toolkit";

const initialState ={
    currentTurf:null,
    loading:false,
    error:false,
}

const turfSlice= createSlice({
    name:'turf',
    initialState,
    reducers:{
        signInSuccess :(state,action)=>{
            state.currentTurf = action.payload;
            state.loading = false;
            state.error = false;
        },
        signout :(state)=>{
            state.currentTurf=null;
            state.loading = false;
            state.error= false;
        }
    }
})

export const {signInSuccess,signout} = turfSlice.actions;

export default turfSlice.reducer;