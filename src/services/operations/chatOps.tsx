import {chatEndpoints} from "../apis"
import {apiConnector} from "../apiConnector"
import {type AxiosResponse} from "axios";


export const getAllChatsAPI=async():Promise<AxiosResponse>=>{
   
          const result=await apiConnector({method:"GET",url:chatEndpoints.GET_ALL_CHATS});
       
         
            return result;
}

export const personalChatAPI=async(id:string):Promise<AxiosResponse>=>{
        
  const result=await apiConnector({method:"GET",url:`${chatEndpoints.PERSONAL_CHAT}/${id}`});
    return result;
}

export const createNewChatAPI = async(otherUserId: string) => {
     const result=await apiConnector({method: "POST",url:chatEndpoints.CREATE_CHAT,body: { otherUserId },});
     return result;
};

export const sendMessageAPI = async (chatId: string, text: string) => {
 
    const result=await apiConnector({method: "POST",url:chatEndpoints.MESSAGE,body: { chatId, text }, });
      
    return result;
};


export const messageSeenAPI=async(chatid:string,messageId:string)=>{
    const result=await apiConnector({method: "POST",url: chatEndpoints.MESSAGE_SEEN,body: { chatId: chatid, messageIds: [messageId]
    }
  });
  return result;
}