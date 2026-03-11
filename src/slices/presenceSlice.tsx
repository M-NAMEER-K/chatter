
import { createSlice } from "@reduxjs/toolkit";

interface PresenceState{
  onlineUserIds:string[]
}

const initialState:PresenceState={
  onlineUserIds:[]
}

const presenceSlice=createSlice({
  name:"presence",
  initialState,
  reducers:{
    setOnlineUsers:(state,action)=>{
      state.onlineUserIds=action.payload
    },
    userOnline:(state,action)=>{
      if(!state.onlineUserIds.includes(action.payload)){
        state.onlineUserIds.push(action.payload)
      }
    },
    userOffline:(state,action)=>{
      state.onlineUserIds=
        state.onlineUserIds.filter(id=>id!==action.payload)
    }
  }
})

export const { userOnline,userOffline,setOnlineUsers } = presenceSlice.actions;
export default presenceSlice.reducer;