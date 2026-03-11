import {User} from "../models/User"
import {FriendRequest} from "../models/FriendRequest"
import { AuthenticatedRequest } from "../middlewares/isAuth";
import {Response} from "express"
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const SOCKET_SERVICE=process.env.SOCKET_SERVICE;
const SERVICE_SECRET=process.env.SERVICE_SECRET;
export const sendFriendRequest = async (req: AuthenticatedRequest,res: Response): Promise<Response> => {
  try {
  
    const senderId = req.user?._id;
    const { receiverId } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (senderId === receiverId) {
      return res.status(400).json({ message: "Cannot send request to yourself" });
    }

   
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "Friend request already exists",
      });
    }

    const request = await FriendRequest.create({
      sender: senderId,
      receiver: receiverId,
    });
        
       
    const result=  await axios.post(`${SOCKET_SERVICE}/notify`, {userId: receiverId,  senderId: senderId,   type:"FRIEND_REQUEST",
message: `${req.user?.name} has sent you a friend request`
},
  {
    headers: {
      "x-service-secret": process.env.SERVICE_SECRET
    }});
       
    return res.status(200).json({
      success: true,
      message: "Friend request sent",
      data: request,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({ message: error.message });
  }
};


export const cancelFriendRequest = async ( req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const senderId = req.user?._id;
    const { receiverId } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const request = await FriendRequest.findOneAndDelete({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({
        message: "Friend request not found",
      });
    }
    
     const receiverIdToSend = request.receiver.toString();

// ✅ emit silent event
await axios.post(
  `${SOCKET_SERVICE}/request-removed`,
  {
    userId: receiverIdToSend,
    senderId: senderId,
  },
  {
    headers: {
      "x-service-secret": process.env.SERVICE_SECRET
    }
  }
);



    return res.status(200).json({
      success: true,
      message: "Friend request cancelled",
    });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};



export const getPendingRequests = async (req: AuthenticatedRequest, res: Response):Promise<Response>=> {
  try {
    const userId = req.user?._id;

    const requests = await FriendRequest.find({
      receiver: userId,
      status: "pending",
    }).populate("sender", "name email");

   return res.status(200).json({ success: true, data:requests });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};



interface IUserPopulated {
  _id: string;
  name: string;
}

export const rejectRequest = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId: string|undefined = req.user?._id;
    const { requestId } = req.params;

    const request = await FriendRequest.findById(requestId)
      .populate<{ receiver: IUserPopulated }>("receiver", "name")
      .populate<{ sender: IUserPopulated }>("sender", "_id");

    if (!request)
      return res.status(404).json({ message: "Request not found" });

    // Now TypeScript KNOWS receiver has name and _id
    if (request.receiver._id.toString() !== userId?.toString())
      return res.status(403).json({ message: "Unauthorized" });

    const receiver = request.receiver;
    const sender = request.sender;

    await FriendRequest.findByIdAndDelete(requestId);

    await axios.post(
      `${SOCKET_SERVICE}/notify`,
      {
        userId: sender._id,
        type: "REQUEST_REJECTED",
        message: `${receiver.name} rejected your friend request`
      },
      {
        headers: {
          "x-service-secret": process.env.SERVICE_SECRET
        }
      }
    );

    return res.json({
      success: true,
      message: "Friend request rejected"
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};


export const acceptRequest = async (req: AuthenticatedRequest,res: Response): Promise<Response> => {
  try {
    const receiverId = req.user?._id;
    const { requestId } = req.params;

    const request = await FriendRequest.findById(requestId)
      .populate("sender", "name")
      .populate("receiver", "name");

    if (!request)
      return res.status(404).json({ message: "Request not found" });

    if (request.receiver._id.toString() !== receiverId)
      return res.status(403).json({ message: "Unauthorized" });

    const sender = request.sender as any;
    const receiver = request.receiver as any;

    // add both as friends
    await User.findByIdAndUpdate(receiverId, {
      $addToSet: { friends: sender._id },
    });

    await User.findByIdAndUpdate(sender._id, {
      $addToSet: { friends: receiverId },
    });

    await FriendRequest.findByIdAndDelete(requestId);

    // ✅ notify sender
    await axios.post(
      `${SOCKET_SERVICE}/notify`,
      {
        userId: sender._id,
        type: "REQUEST_ACCEPTED",
        message: `${receiver.name} accepted your friend request`,
        senderId: receiverId
      },
      {
        headers: {
          "x-service-secret": process.env.SERVICE_SECRET
        }
      }
    );

    // ✅ notify receiver
    await axios.post(
      `${SOCKET_SERVICE}/notify`,
      {
        userId: receiverId,
        type: "NEW_FRIEND",
        message: `${sender.name} is now your friend`,
        senderId: sender._id
      },
      {
        headers: {
          "x-service-secret": process.env.SERVICE_SECRET
        }
      }
    );

    return res.json({
      success: true,
      message: "Friend request accepted"
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const getSentRequests = async (req: AuthenticatedRequest,res: Response): Promise<Response> => {
  try {
    console.log("im checking");
    const userId = req.user?._id;
   
    const sentRequests = await FriendRequest.find({
      sender: userId,
      status: "pending",
    }).select("receiver");
    
    const userData=sentRequests.map(req => req.receiver.toString());
    return res.status(200).json({
      success: true,
      data:userData
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};



export const removeFriend = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const friendId = req.params.friendId;

    if (!userId || !friendId) {
      return res.status(400).json({ success: false, message: "Missing ids" });
    }

    // remove from both users
    await User.findByIdAndUpdate(userId, {
      $pull: { friends: friendId }
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: userId }
    });

    // notify socket service
    await axios.post(
      `${SOCKET_SERVICE}/friendRemoved`,
      { userId, friendId },
      {
        headers: { "x-service-secret": SERVICE_SECRET }
      }
    );

    return res.json({ success: true });

  } catch (err) {
    return res.status(500).json({ success: false });
  }
};