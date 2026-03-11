import {createSlice,type PayloadAction} from "@reduxjs/toolkit"

export interface IUserAuth{
    _id:string,
    name:string,
    email:string
}
export  interface IAuth{
       token:string|null,
       user:IUserAuth|null
}
const initialState:IAuth={
        token:localStorage.getItem("token")||null,
       user: localStorage.getItem("user")? JSON.parse(localStorage.getItem("user")!): null
};



const authSlice=createSlice({
    name:"auth",
    initialState:initialState,
    reducers:{
        setToken:(state,action:PayloadAction<string|null>)=>{
             state.token=action.payload
        },
        setUser:(state,action:PayloadAction<IUserAuth|null>)=>{
              state.user=action.payload
        }
    }
});


export const {setToken,setUser}=authSlice.actions;

export default authSlice.reducer;