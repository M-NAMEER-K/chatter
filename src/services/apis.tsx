const BASE_URL1=import.meta.env.VITE_API_URL1;
const BASE_URL2=import.meta.env.VITE_API_URL2;





const REST_API="/api/v1"
export const authEndpoints={
     SEND_OTP:BASE_URL1+REST_API+"/sendOtp",
     RESEND_OTP:BASE_URL1+REST_API+"/resendOtp",
     REGISTER_USER:BASE_URL1+REST_API+"/registerUser",
     LOGIN_USER:BASE_URL1+REST_API+"/loginUser",
     LOGOUT_USER:BASE_URL1+REST_API+"/logoutUser",
     VERIFY_USER: BASE_URL1 + REST_API + "/me",

     ALL_USERS:BASE_URL1+REST_API+"/getAllUsers",
     GET_MY_FRIENDS:BASE_URL1+REST_API+"/getMyFriends",
     SET_PROFILE_PICTURE:BASE_URL1+REST_API+"/profile-picture",
     GET_PROFILE_DATA:BASE_URL1+REST_API+"/getProfileData",

     CHANGE_PASSWORD:BASE_URL1+REST_API+"/changePassword",
     CHANGE_USERNAME:BASE_URL1+REST_API+"/changeUsername",
     FORGOT_PASSWORD:BASE_URL1+REST_API+"/forgotPassword",
     RESET_PASSWORD:BASE_URL1+REST_API+"/resetPassword"

}
export const chatEndpoints={
        GET_ALL_CHATS:BASE_URL2+REST_API+"/chat/all",
        CREATE_CHAT:BASE_URL2+REST_API+"/chat/new",
        PERSONAL_CHAT:BASE_URL2+REST_API+"/chat",
        MESSAGE:BASE_URL2+REST_API+"/message",
        MESSAGE_SEEN:BASE_URL2+REST_API+"/message/seen"
}
export const requestEndpoints={
         SEND_REQUEST:BASE_URL1+REST_API+"/send",
         CANCEL_REQUEST:BASE_URL1+REST_API+"/cancel",
         ACCEPT_REQUEST:BASE_URL1+REST_API+"/accept",
         REJECT_REQUEST:BASE_URL1+REST_API+"/reject",
         GET_REQUEST:BASE_URL1+REST_API+"/pending",
         SENT_REQUEST:BASE_URL1+REST_API+"/sent",
         REMOVE_REQUEST:BASE_URL1+REST_API+ "/remove-friend"
}