import type{NavigateFunction} from "react-router-dom"
import {apiConnector} from "../apiConnector"
import {authEndpoints} from "../apis"
import {setToken,setUser} from "../../slices/authSlice"
import {socket} from "../socket/socket"
import Toast from "react-hot-toast"
import {type AppDispatch} from "../../reducer/store"
import {type AxiosResponse} from "axios"
export interface IRegister{
        email:string,
        password?:string,
        name?:string
}
export interface ILogin{
        email:string,
        password:string
}
export interface IVerify{
        email:string,
        otp:string
}

export const registerAPI= async({email,password,name}:IRegister,navigate:NavigateFunction):Promise<void>=>{
        
             const result= await apiConnector({method:"POST",url:authEndpoints.SEND_OTP,body:{email,password,name}});
                                 if(result.data.success){
                                   Toast.success(result.data.message);
                                  navigate(`/verify?email=${email}`);
                            }
                            else{
                                 Toast.error(result.data.message);
                            }
          
}
export const loginAPI =async({email,password}:ILogin,navigate:NavigateFunction,dispatch:AppDispatch):Promise<void>=>{

       const result=await apiConnector({method:"POST",url:authEndpoints.LOGIN_USER,body:{email,password}});
     
                 
                           if(result.data.success){
                                   Toast.success(result.data.message);
                      localStorage.setItem("token",result.data.data.token);
                      localStorage.setItem("user", JSON.stringify(result.data.data.userData));
                           dispatch(setToken(result.data.data.token));
                           dispatch(setUser(result.data.data.userData));
                             socket.auth = { token: result.data.data.token };
                             socket.connect();
                                  navigate(`/chat`);
                            }
                            else{
                                 Toast.error(result.data.message);
                            }
       
}
export const resendOtpAPI= async({email}:IRegister):Promise<void>=>{
      
             await apiConnector({method:"POST",url:authEndpoints.RESEND_OTP,body:{email}});
            
            
}


export const verifyAPI=async({email,otp}:IVerify,navigate:NavigateFunction):Promise<void>=>{
       
               const result=await apiConnector({method:"POST",url:authEndpoints.REGISTER_USER,body:{email,otp}});
                if(result.data.success){
                         Toast.success(result.data.message); 
                         navigate("/login"); 
                    }
                    else{
                        Toast.error(result.data.message);
                    }
              
               
}
export const logoutAPI=async(navigate:NavigateFunction,dispatch:AppDispatch):Promise<void>=>{
             const result=await apiConnector({method:"POST",url:authEndpoints.LOGOUT_USER});
               if(result.data.success){
                         Toast.success(result.data.message); 
                     localStorage.removeItem("token");
                       localStorage.removeItem("user");
                      dispatch(setToken(null));
                      dispatch(setUser(null));
                          socket.auth={};
                           socket.io.opts.reconnection = false; 
                           socket.disconnect();   
                      console.log(" Socket disconnected on logout");
                      navigate("/login");
                    }
                    else{
                        Toast.error(result.data.message);
                    }
                  
}

export const allUsersAPI=async():Promise<AxiosResponse>=>{
        
            const result=await apiConnector({method:"GET",url:authEndpoints.ALL_USERS});
           
                   
                      return result;
}

export const getMyFriendsAPI=async():Promise<AxiosResponse>=>{
        const result=await apiConnector({method:"GET",url:authEndpoints.GET_MY_FRIENDS});
        return result;
}

export const uploadProfilePicAPI = async (file: File):Promise<AxiosResponse> => {
  const formData = new FormData();
  formData.append("image", file);

  const result= apiConnector({method: "POST",url:authEndpoints.SET_PROFILE_PICTURE,body: formData });
   return result;
};

export const profileDataAPI=async(id:string):Promise<AxiosResponse>=>{
  
               const result=await apiConnector({method:"GET",url:`${authEndpoints.GET_PROFILE_DATA}/${id}`});
               console.log(result);
               return result;
}

export const changeUsernameAPI=async(id:string,username:string):Promise<void>=>{
           const result=await apiConnector({method:"POST",url:authEndpoints.CHANGE_USERNAME,body:{id,username}});
           
           if(result.data.success){
               Toast.success(result.data.message);
           }
}
export const changePasswordAPI=async(id:string,password:string,navigate:NavigateFunction,dispatch:AppDispatch):Promise<void>=>{
            const result=await apiConnector({method:"POST",url:authEndpoints.CHANGE_PASSWORD,body:{id,password}});
            if(result.data.success){
               Toast.success(result.data.message);
                 localStorage.removeItem("token");
                localStorage.removeItem("user");
                      dispatch(setToken(null));
                      dispatch(setUser(null));
                        socket.disconnect();
                      
                      navigate("/login");
                  
           }
}

export const forgotPasswordAPI=async(email:string):Promise<void>=>{
                  
          try{
                      const result=await apiConnector({method:"POST",url:authEndpoints.FORGOT_PASSWORD,body:{email}});
                  if(result.data.success){
              Toast.success(result.data.message);
          }
          }
          catch(err:any){
                Toast.error(err.response.data.message);
          }
          
          
}

export const ResetPasswordAPI=async(token:string|undefined,password:string,navigate:NavigateFunction):Promise<void>=>{
       
     const result=await apiConnector({method: "POST",url: `${authEndpoints.RESET_PASSWORD}/${token}`,body: { password }});

    navigate("/login");
}