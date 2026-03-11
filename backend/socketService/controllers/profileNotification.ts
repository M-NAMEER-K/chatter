import {Request,Response} from "express"
import {io} from "../index"



export const profileNotification = async (req: Request, res: Response) => {
     
    console.log("coming");
  const { userId, senderId, profileImage } = req.body;

  io.to(userId.toString()).emit("profilePicUpdated", {
    senderId,
    profileImage
  });

  return res.status(200).json({
    success: true
  });
};

