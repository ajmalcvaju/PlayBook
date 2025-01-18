import { createSlice} from "@reduxjs/toolkit";

const initialState ={
    admin:false,
    loading:false,
    error:false,
}

const adminSlice = createSlice({
    name:'admin',
    initialState,
    reducers:{
        signInSuccess :(state,action)=>{
            state.admin = true;
            state.loading = false;
            state.error = false;
        },
        signout :(state)=>{
            state.admin=false;
            state.loading = false;
            state.error= false;
        }
    }
})

export const {signInSuccess,signout} = adminSlice.actions;

export default adminSlice.reducer;