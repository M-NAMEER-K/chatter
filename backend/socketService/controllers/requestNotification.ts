import {Request,Response} from "express"
import {io} from "../index"

export const requestNotification=async(req:Request, res:Response):Promise<Response> => {
  const { userId, type, message,senderId} = req.body;
  
  io.to(userId).emit("notification", {
    type,
    message,
    senderId
  });

  return res.status(200).json({
     success: true });
}

export const requestRemovedNotification= async (req: Request, res: Response): Promise<Response> => {

  const { userId, senderId } = req.body;

  io.to(userId).emit("requestRemoved", {
    senderId
  });

  return res.status(200).json({
    success: true
  });

};


export const friendRemoved = async (req:Request,res:Response)=>{
  const { userId, friendId } = req.body

  io.to(userId).emit("friendRemoved", { userId, friendId })
  io.to(friendId).emit("friendRemoved", { userId, friendId })

  res.json({success:true})
}

export const friendAdded = async (req:Request,res:Response)=>{

  const { userId, friendId } = req.body

  io.to(userId).emit("friendAdded",{userId,friendId})
  io.to(friendId).emit("friendAdded",{userId,friendId})

  res.json({success:true})
}