import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const updateUserThunk = createAsyncThunk("users/update", async (user) =>{
    const res = await axios.post("http://localhost:8800/api/users/123/update", user);
    return res.data;
});

export const deleteUserThunk = createAsyncThunk("users/delete", async (user) =>{
    const res = await axios.post("http://localhost:8800/api/users/123/delete", user);
    return res.data;
});

export const userSlice = createSlice({
    name:"user",
    initialState:{
        userInfo: {
            name:"Kibe",
            email:"georgekibew@gmail.com"
        },
        pending:null,
        error:false,
    },
    reducers:{
    },
    extraReducers:{
       [updateUserThunk.pending]: (state) =>{
           state.pending = true;
           state.error = false;
       },
       [updateUserThunk.fulfilled]: (state, action) =>{
            state.pending = false;
            state.userInfo = action.payload;
        },
        [updateUserThunk.rejected]: (state) =>{
            state.pending = false;
            state.error = true;
        },
    }
})

export const {updateStart, updateSuccess, updateError} = userSlice.actions;
export default userSlice.reducer;


// update: (state, action) =>{
//     state.name = action.payload.name;
//     state.email = action.payload.email;
// },
// remove:(state) => (state = {}),
// addHello:(state, action) =>{
//     state.name="Hello "+action.payload.name
// }
// updateStart :(state) =>{
//     state.pending = true;
// },
// updateSuccess: (state, action) =>{
//     state.pending =false;
//     state.userInfo = action.payload;
// },
// updateError : (state) =>{
//     state.error = true;
//     state.pending = false;
// }
// }