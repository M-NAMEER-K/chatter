import {AuthenticatedRequest} from "../middlewares/isAuth"
import {Response} from "express"
import { Chat } from "../models/Chat";
import {Messages} from "../models/Messages"
import axios from "axios"
export const createNewChat= async(req:AuthenticatedRequest,res:Response) : Promise<Response>=>{
      try{
           const userId=req.user?._id;
    const {otherUserId}=req.body;
    if(!otherUserId){
          return res.status(400).json({
               success:false,
               message:"Other userid is required"
          });
    }
      
    const existingChat=await Chat.findOne({users:{$all:[userId,otherUserId]}});
     if(existingChat){
          return res.status(200).json({
               message:"Chat already exist",
               chatId:existingChat._id
          });
     }

    const newChat=await Chat.create({
          users:[userId,otherUserId]
    });
     

     return res.status(200).json({
         success:true,
         message:"New Chat created",
         chatId:newChat._id
     });


      } 
      catch(err){
          console.log(err);
          return res.status(400).json({
             success:false,
             message:"new chat not created"
          });
      } 
   
}

export const getAllChats=async ( req:AuthenticatedRequest, res:Response) : Promise<Response>=>{
    
   const userId=req.user?._id;
    console.log(userId);
   if(!userId){
        return res.status(400).json({
          success:false,
          message:"userId is missing"
        });
   }
     const chats=await Chat.find({ users:userId}).sort({updatedAt:-1});

     const chatWithUserData=await Promise.all(
           chats.map(
               async(chat)=>{ const otherUserId = chat.users.find(
  (id) => id.toString() !== userId.toString()
);
             
                    const unseenCount=await Messages.countDocuments({
                         chatId:chat._id,
                         sender:{$ne:userId},
                         seen:false
                    });
                     try{
               const { data } = await axios.get(`${process.env.USER_SERVICE}/api/v1/getProfileData/${otherUserId}`,
  {
   headers: {
  Authorization: req.headers.authorization
},
  }
);

                  
                console.log("data:",data);
                  return {
                      user:data,
                      chat:{
                         ...chat.toObject(),
                         latestMessage:chat.latestMessage || null,
                         unseenCount
                      }
                  };
                   }
                   catch(err){
                    console.log(err);
                       return {
                            user:{   _id:otherUserId ,
                                name:"Unknown user"
                            },
                            chat:{
                              ...chat.toObject(),
                              latestMessage:chat.latestMessage || null,
                              unseenCount
                            }
                       };
                   }
                }
                   )
                  
     )


     return res.status(200).json({
          success:true,
          message:"Fetched all chats",
          data:chatWithUserData

     });
}

export const sendMessage=async (req:AuthenticatedRequest , res:Response) : Promise<Response>=>{
        
     const senderId=req.user?._id;
     const {chatId,text}=req.body;
    

      if(!senderId){
          return res.status(401).json({
                success:false,
                message:"Unauthorized request"
          });
      }
      if(!chatId){
         return res.status(400).json({
              success:false,
              message:"Chat required"
         });
      }

      if(!text ){
            return res.status(400).json({
               success:false,
               message:"Either chat or image is required"
            });
      }
      const chat=await Chat.findById(chatId);
      if(!chat){
            return res.status(404).json({
               success:false,
               message:"Chat not found"
            });
      }

      const isUserInChat=chat.users.some(
          (userId)=> userId.toString()=== senderId.toString()
      );
      if(!isUserInChat){
           return res.status(403).json({
                success:false,
                message:"You are not a participant of this chat"
           });
      }
     
      const otherUserId=chat.users.find(
          (userId)=>userId.toString()!==senderId.toString()
      );

      if(!otherUserId){
           return res.status(400).json({
                success:false,
                message:"no other user"
           });
      }

       //socket setup


       let messageData:any={
           chatId:chatId,
           sender:senderId,
           seen:false,
           seenAt:undefined,
            delivered: false,
           deliveredAt: undefined
       }
      
       
            messageData.text=text;
            messageData.messageType="text";
      
       const message=new Messages(messageData);
       const savedMessage=await message.save();
       // Check if receiver is online by pinging socket service
       console.log('i');
const socketRes = await axios.post(
  `${process.env.SOCKET_SERVICE}/api/v1/checkUserOnline`,
  { userId: otherUserId },
  {
    headers: {
      "x-service-secret": process.env.SERVICE_SECRET
    }
  }
);
   console.log("j");

const isReceiverOnline = socketRes.data.online;

if (isReceiverOnline) {
  savedMessage.delivered = true;
  savedMessage.deliveredAt = new Date();
  await savedMessage.save();
  console.log("delivering");
       await axios.post(
    `${process.env.SOCKET_SERVICE}/api/v1/messageDelivered`,
    {
      senderId: senderId,
      messageId: savedMessage._id
    },
    {
      headers: {
        "x-service-secret": process.env.SERVICE_SECRET
      }
    }
  );

}  
console.log("delivered");

       const latestMessageText=text;

          await Chat.findByIdAndUpdate(chatId,{
                  latestMessage:{
                      text:latestMessageText,
                      sender:senderId,
                       createdAt:savedMessage.createdAt
                  },
                  updatedAt:savedMessage.createdAt,

          },
          {new:true}
     );
     
        console.log("working");
       await axios.post(
  `${process.env.SOCKET_SERVICE}/api/v1/newMessage`,
  {
    chatId,
    message: savedMessage,
    receiverId: otherUserId ,
     senderId: senderId
  },
  {
    headers: {
      "x-service-secret": process.env.SERVICE_SECRET
    }
  }
);
console.log("not working");

          return res.status(201).json({
                 success:true,
                 message:savedMessage,
                 sender:senderId
          });
}


export const getMessagesByChat=async(req:AuthenticatedRequest,res:Response)=>{

          const userId=req.user?._id;
          const {chatId}=req.params;
              console.log(userId,chatId);
          if(!userId){
               return res.status(400).json({
                   message:"Unauthorized"
               });
          }
          if(!chatId){
                 return res.status(400).json({
                      message:"ChatId Required"
                 });
          }

          const chat=await Chat.findById(chatId);
                 
          if(!chat){
                return res.status(400).json({
                    success:false,
                     message:"Chat not found"
                });
          }
          const isUserInChat=chat.users.some(
               (id)=>id.toString()===userId.toString()
          );
          if(!isUserInChat){
               return res.status(400).json({
                 message:"You are not a participated of this chat"
               });
          }
            
const undeliveredMessages = await Messages.find({
  chatId,
  sender: { $ne: userId },
  delivered: false
});
const otherUserId = chat.users.find(
  (id) => id.toString() !== userId.toString()
);
if (undeliveredMessages.length > 0) {

  await Messages.updateMany(
    {
      chatId,
      sender: { $ne: userId },
      delivered: false
    },
    {
      delivered: true,
      deliveredAt: new Date()
    }
  );
 
  await axios.post(
    `${process.env.SOCKET_SERVICE}/api/v1/bulkDelivered`,
    {
      senderId: otherUserId,
      messageIds: undeliveredMessages.map(m => m._id)
    },
    {
      headers: {
        "x-service-secret": process.env.SERVICE_SECRET
      }
    }
  );
}

          const messageToMarkSeen=await Messages.find({
               chatId:chatId,
               sender:{$ne:userId},
               seen:false
          });
         await Messages.updateMany({
               chatId:chatId,
               sender:{$ne:userId},
               seen:false
         },{
          seen:true,
          seenAt:new Date()
         }
     );
         
      await axios.post(`${process.env.SOCKET_SERVICE}/api/v1/chatSeen`,
  {
    chatId,
    seenMessageIds: messageToMarkSeen.map(m => m._id)
  },
  {
    headers: {
      "x-service-secret": process.env.SERVICE_SECRET
    }
  }
);

       const messages=await Messages.find({chatId}).sort({createdAt:1});

       

       try{
          const { data } = await axios.get(
  `${process.env.USER_SERVICE}/api/v1/getProfileData/${otherUserId}`,
  {
   headers: {
  Authorization: req.headers.authorization
},
  }
);
console.log(data);


          if(!otherUserId){
               return res.status(400).json({
                  message:"No other user"
               });
          }
              const friendshipRes = await axios.get(
    `${process.env.USER_SERVICE}/api/v1/checkFriendship/${otherUserId}`,
    {
    headers: {
  Authorization: req.headers.authorization
}
    }
  );

  const isFriend = friendshipRes.data.isFriend;
          

           //socket work
           

          return res.json({
  messages,
  user: {
    data: {
      ...data.data,
      isFriend
    }
  }
});
       }
       catch(err){
             console.log(err);
             return res.json({
               messages,
               user:{_id:otherUserId , name:"Unknown user"}
             });
       }   
}


export const markMessagesSeen = async (req: AuthenticatedRequest, res: Response) => {

  const userId = req.user?._id;
  const { chatId, messageIds } = req.body;

  if (!userId) return res.status(401).json({ success: false });

  await Messages.updateMany(
    {
      _id: { $in: messageIds },
      sender: { $ne: userId }
    },
    {
      seen: true,
      seenAt: new Date()
    }
  );

  await axios.post(`${process.env.SOCKET_SERVICE}/api/v1/chatSeen`,
    {
      chatId,
      seenMessageIds: messageIds
    },
    {
      headers: {
        "x-service-secret": process.env.SERVICE_SECRET
      }
    }
  );

  return res.json({ success: true });
};

export const deliverPendingMessages = async (req: AuthenticatedRequest, res: Response) => {

  const { userId } = req.body;

  // 1️⃣ Find all chats where this user participates
  const chats = await Chat.find({ users: userId });

  const chatIds = chats.map(chat => chat._id);

  // 2️⃣ Find messages sent TO this user and not delivered
  const undelivered = await Messages.find({
    chatId: { $in: chatIds },
    sender: { $ne: userId },
    delivered: false
  });

  if (undelivered.length === 0) {
    return res.json({ success: true });
  }

  // 3️⃣ Mark them delivered
  await Messages.updateMany(
    {
      _id: { $in: undelivered.map(m => m._id) }
    },
    {
      delivered: true,
      deliveredAt: new Date()
    }
  );

  // 4️⃣ Group by sender
  const grouped: Record<string, string[]> = {};

  undelivered.forEach(msg => {
    if (!grouped[msg.sender]) grouped[msg.sender] = [];
    grouped[msg.sender].push(msg._id.toString());
  });

  // 5️⃣ Notify each sender
  for (const senderId in grouped) {
    await axios.post(
      `${process.env.SOCKET_SERVICE}/api/v1/bulkDelivered`,
      {
        senderId,
        messageIds: grouped[senderId]
      },
      {
        headers: {
          "x-service-secret": process.env.SERVICE_SECRET
        }
      }
    );
  }

  return res.json({ success: true });
};
