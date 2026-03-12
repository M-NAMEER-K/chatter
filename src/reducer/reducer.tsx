import {combineReducers} from "@reduxjs/toolkit"
import authReducer from "../slices/authSlice"
import notificationReducer from "../slices/notifySlice"
import presenceReducer from "../slices/presenceSlice"
import searchReducer from "../slices/searchSlice"


const rootReducer = combineReducers({
          "auth":authReducer,
           "notification": notificationReducer,
           "search":searchReducer,
           "presence":presenceReducer
})

export default rootReducer;