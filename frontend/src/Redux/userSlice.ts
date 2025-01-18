import { createSlice} from "@reduxjs/toolkit";

const initialState ={
    currentUser:null,
    loading:false,
    error:false,
}

const userSlice= createSlice({
    name:'user',
    initialState,
    reducers:{
        signInSuccess :(state,action)=>{
            state.currentUser = action.payload;
            state.loading = false;
            state.error = false;
        },
        logout :(state)=>{
            state.currentUser=null;
            state.loading = false;
            state.error= false;
        }
    }
})

export const {signInSuccess,logout} = userSlice.actions;

export default userSlice.reducer;