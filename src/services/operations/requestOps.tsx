import {apiConnector} from "../apiConnector"
import {requestEndpoints} from "../apis"
import {type AxiosResponse} from "axios"

export const sendFriendRequestAPI = async (receiverId: string):Promise<AxiosResponse> => {
  const result=apiConnector({method: "POST",url: requestEndpoints.SEND_REQUEST,body: { receiverId },});
 
  return result;
}; 

export const cancelFriendRequestAPI = async (receiverId: string):Promise<AxiosResponse> => {
  return apiConnector({method: "POST",url: requestEndpoints.CANCEL_REQUEST,body: { receiverId },
  });
};
export const getPendingRequestAPI = async():Promise<AxiosResponse> =>{
    const result=await apiConnector({method:"GET",url:requestEndpoints.GET_REQUEST});
    return result;
}
  
export const acceptRequestAPI = async(id: string):Promise<void> =>{
          const result=await apiConnector({method:"POST",url:`${requestEndpoints.ACCEPT_REQUEST}/${id}`});
}


export const rejectRequestAPI = async(id: string):Promise<void> =>{
             const result=await apiConnector({method:"POST",url:`${requestEndpoints.REJECT_REQUEST}/${id}`});
}

export const sentRequestAPI=async():Promise<AxiosResponse>=>{
  console.log("checking");
        const result=await apiConnector({method:"GET",url:requestEndpoints.SENT_REQUEST});
        console.log("checked");
        return result;
}

export const removeFriendAPI=async(id:string):Promise<AxiosResponse>=>{

        const result=await apiConnector({method:"POST",url:`${requestEndpoints.REMOVE_REQUEST}/${id}`});
        console.log("checked");
        return result;
}
