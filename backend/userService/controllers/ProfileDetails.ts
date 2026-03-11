import{Request,Response} from "express"
import { AuthenticatedRequest } from "../middlewares/isAuth";
import {User} from "../models/User"
import  bcrypt from "bcrypt"

import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const SOCKET_SERVICE=process.env.SOCKET_SERVICE;


export const uploadProfilePicture = async (req: AuthenticatedRequest,res: Response): Promise<Response> => {
  try {
    const userId = req.user?._id;
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    

    user.profileImage = {
      url: imageFile.path,
      publicId: imageFile.filename,
    };

    await user.save();
   console.log("working");
await axios.post(
  `${SOCKET_SERVICE}/profilePicUpdated`,
  {
    userId: user._id,        // room to send event
    senderId: user._id,      // who updated
    profileImage: user.profileImage
  },
  {
    headers: {
      "x-service-secret": process.env.SERVICE_SECRET
    }
  }
);


  console.log("worked");
    return res.status(200).json({
      success: true,
      message: "Profile picture updated",
      data: user.profileImage,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Failed to upload profile picture",
    });
  }
};


export const getAllUsers=async(req:Request,res:Response):Promise<Response>=>{
  
                 const allUsers=await User.find({});
                 return res.status(200).json({
                    success:true,
                    data:allUsers
                 });
}



export const getMyFriends = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;

  const user = await User.findById(userId).populate(
    "friends",
    "name email profileImage"
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({
    success: true,
    data: user.friends,
  });
};


export const getProfileData=async(req:Request,res:Response)=>{
  
           const {id}=req.params;
               
          const user = await User.findById(id).populate("friends","name profileImage" );

              
             if(!user){
              return res.status(404).json({
                 success:false,
                 message:"user not found"
              });
             }

             return res.status(200).json({
                 success:true,
                 message:"User data is found",
                 data:user
             });


}

export const changePassword=async(req:AuthenticatedRequest,res:Response)=>{
         
  const {id,password}=req.body;
   const user=await User.findById(id);
   if(!user){
             return res.status(400).json({
                success:false,
                message:"Use not found"
             });
         }
         const hashPassword=await bcrypt.hash(password,10);
             user.password=hashPassword;
              await user.save();
             return res.status(200).json({
              success:true,
              message:"Password updated successfully"
             });
}

export const changeUsername=async(req:AuthenticatedRequest,res:Response)=>{
      const {id,username}=req.body;
         const user=await User.findById(id);
         if(!user){
             return res.status(400).json({
                success:false,
                message:"Use not found"
             });
         }
         
         user.name=username;
         await user.save();
         return res.status(200).json({
           success:true,
           message:"Username changed successfully"
         });
}

export const updateLastSeen = async (req:AuthenticatedRequest,res:Response) => {
  const { userId } = req.params;
  const { lastSeen } = req.body;

  await User.findByIdAndUpdate(userId, {
    lastSeen
  });

  res.json({
    success: true
  });
};

export const checkFriendship = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const { otherUserId } = req.params;

  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized"
    });
  }

  const user = await User.findById(userId).select("friends");

  const isFriend = user?.friends.some(
    (id) => id.toString() === otherUserId.toString()
  );

  return res.json({
    success: true,
    isFriend
  });
};