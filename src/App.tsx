import {useEffect,useState} from "react"
import Register from "./Components/User/Register"
import Verify from "./Components/User/Verify"
import ForgotPassword from "./Components/User/ForgotPassword"
import ResetPassword from "./Components/User/ResetPassword"
import Notification from "./Components/Chat/Notification"
import Chat from "./Components/Chat/Chat"
import Login from "./Components/User/Login"
import PersonelChat from "./Components/Chat/PersonelChat"
import Profile from "./Components/User/Profile"
import Settings from "./Components/User/Settings"
import AddUsers from "./Components/Chat/AddUsers"
import Layout from "./Components/Utils/Layout"
import ChatLayout from "./Components/Utils/ChatLayout"
import {Routes,Route} from "react-router-dom"
import  {socket}  from "./services/socket/socket";
import { useDispatch } from "react-redux";
import { addNotification } from "./slices/NotificationSlice";
import './App.css'
import {authEndpoints} from "./services/apis"
import { apiConnector } from "./services/apiConnector";
import { setUser, setToken } from "./slices/authSlice";
import { useNavigate } from "react-router-dom";
import { setOnlineUsers, userOnline, userOffline } from "./slices/presenceSlice";

function App() {
       const dispatch=useDispatch();
       const navigate=useNavigate();
       
       
       
        useEffect(() => {

  const handleInitialOnlineUsers = (data:any)=>{
    dispatch(setOnlineUsers(data.onlineUserIds));
  };

  const handleUserOnline = ({userId}:any)=>{
    dispatch(userOnline(userId));
  };

  const handleUserOffline = ({userId}:any)=>{
    dispatch(userOffline(userId));
  };

  socket.on("initialOnlineUsers",handleInitialOnlineUsers);
  socket.on("userOnline",handleUserOnline);
  socket.on("userOffline",handleUserOffline);

  return ()=>{
    socket.off("initialOnlineUsers",handleInitialOnlineUsers);
    socket.off("userOnline",handleUserOnline);
    socket.off("userOffline",handleUserOffline);
  };

},[dispatch]);

useEffect(() => {
    
  const token = localStorage.getItem("token");

  // ✅ Do NOT verify if no token
  if (!token) return;
  const verifyUser = async () => {

    try {

      const res = await apiConnector({
        method: "GET",
        url: authEndpoints.VERIFY_USER
      });

      if (res.data.success) {

        dispatch(setUser(res.data.user));
           socket.auth = {
    token: localStorage.getItem("token")
  };
        // ✅ Connect socket ONLY here
        socket.auth = {
          token: localStorage.getItem("token")
        };

       socket.connect(); 

      }

    } catch (err) {

      // COOKIE INVALID → FULL LOGOUT
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      dispatch(setToken(null));
      dispatch(setUser(null));

      socket.disconnect();

      navigate("/login");

    }

  };

  verifyUser();

}, [dispatch, navigate]);


  useEffect(() => {

  const handleNotification = (data:any) => {
    console.log("Notification received:", data);
    dispatch(addNotification(data));
  };

  const handleRequestRemoved = (data:any) => {
   dispatch(addNotification({
  type: data.type,
  message: data.message,
  senderId: data.senderId
}));

  };

  const handleProfilePicUpdated = (data:any) => {

  dispatch(addNotification({
    type: "PROFILE_UPDATED",
    senderId: data.senderId,
    profileImage: data.profileImage,
    message: "Profile updated"
  }));

};

socket.off("profilePicUpdated", handleProfilePicUpdated);
socket.on("profilePicUpdated", handleProfilePicUpdated);

  // prevent duplicates
  socket.off("notification", handleNotification);
  socket.on("notification", handleNotification);

  socket.off("requestRemoved", handleRequestRemoved);
  socket.on("requestRemoved", handleRequestRemoved);

  return () => {
    socket.off("notification", handleNotification);
    socket.off("requestRemoved", handleRequestRemoved);
      socket.off("profilePicUpdated", handleProfilePicUpdated);
  };

}, []);

 

  return (
      <div className="  overflow-x-hidden
   h-screen overflow-y-auto
  scrollbar scrollbar-thin
scrollbar-thumb-gray-300
scrollbar-track-gray-700

 ">

           <Routes>
              <Route path="/register" element={<Register/>}/>
              <Route path="/login" element={<Login/>}/>
              <Route path="/forgotPassword" element={<ForgotPassword/>}/>      
              <Route path="/reset-password/:token" element={<ResetPassword />} />       
              <Route path="/verify" element={<Verify/>} />
              
                <Route element={<Layout/>}>
                        <Route path="/chat" element={<Chat/>}/>
                      
                          <Route path="/addUsers" element={<AddUsers/>}/>
                            <Route path="/profile" element={<Profile/>}/>
                            <Route path="/settings" element={<Settings/>}/>
                            <Route path="/notifications" element={<Notification/>} />
             
                      
                </Route>

                <Route element={<ChatLayout />}>
                       <Route path="/chat/:chatid" element={<PersonelChat />} />
                </Route>
             
           </Routes>
       
      </div>
  )
}

export default App
