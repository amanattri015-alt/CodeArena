import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "./utils/axiosClient";

const message=(e,fallback)=>e.response?.data?.message || (typeof e.response?.data==="string"?e.response.data:null) || fallback;

export const registerUser=createAsyncThunk("auth/registerUser",async(data,{rejectWithValue})=>{
 try{await axiosClient.post("/user/register",data);const r=await axiosClient.get("/user/check");return r.data}catch(e){return rejectWithValue(message(e,"Registration failed"))}
});
export const loginUser=createAsyncThunk("auth/loginUser",async(data,{rejectWithValue})=>{
 try{await axiosClient.post("/user/login",data);const r=await axiosClient.get("/user/check");return r.data}catch(e){return rejectWithValue(message(e,"Login failed"))}
});
export const checkAuth=createAsyncThunk("auth/checkAuth",async(_,{rejectWithValue})=>{
 try{return (await axiosClient.get("/user/check")).data}catch(e){return rejectWithValue(message(e,"Authentication check failed"))}
});
export const logoutUser=createAsyncThunk("auth/logoutUser",async(_,{rejectWithValue})=>{
 try{return (await axiosClient.post("/user/logout")).data}catch(e){return rejectWithValue(message(e,"Logout failed"))}
});

const initialState={user:null,isAuthenticated:false,loading:false,error:null};
const authSlice=createSlice({name:"auth",initialState,reducers:{},extraReducers:b=>{
 b.addCase(registerUser.pending,s=>{s.loading=true;s.error=null})
  .addCase(registerUser.fulfilled,(s,a)=>{s.loading=false;s.user=a.payload.user;s.isAuthenticated=true})
  .addCase(registerUser.rejected,(s,a)=>{s.loading=false;s.error=a.payload})
  .addCase(loginUser.pending,s=>{s.loading=true;s.error=null})
  .addCase(loginUser.fulfilled,(s,a)=>{s.loading=false;s.user=a.payload.user;s.isAuthenticated=true})
  .addCase(loginUser.rejected,(s,a)=>{s.loading=false;s.error=a.payload;s.isAuthenticated=false})
  .addCase(checkAuth.pending,s=>{s.loading=true})
  .addCase(checkAuth.fulfilled,(s,a)=>{s.loading=false;s.user=a.payload.user;s.isAuthenticated=true})
  .addCase(checkAuth.rejected,s=>{s.loading=false;s.user=null;s.isAuthenticated=false})
  .addCase(logoutUser.pending,s=>{s.loading=true;s.error=null})
  .addCase(logoutUser.fulfilled,s=>{Object.assign(s,initialState)})
  .addCase(logoutUser.rejected,(s,a)=>{s.loading=false;s.error=a.payload});
}});
export default authSlice.reducer;
