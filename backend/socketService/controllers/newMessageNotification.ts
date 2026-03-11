import { Request, Response } from "express";
import { io } from "../index";
import {onlineUsers} from "../socket/setupSocket"
export const newMessageNotification = (req: Request, res: Response) => {

  const { chatId, message, receiverId, senderId } = req.body;

  io.to(chatId).emit("newMessage", message);

  io.to(receiverId).emit("newMessage", message);

  // 🔥 ensure sender UI updates
  io.to(senderId).emit("newMessage", message);

   io.to(receiverId).emit("chatListUpdate", message);
  io.to(senderId).emit("chatListUpdate", message);

  return res.json({
    success: true
  });

};

export const messageSeen = (req: Request, res: Response) => {
  const { chatId, seenMessageIds } = req.body;

  io.to(chatId).emit("chatSeen", {
    chatId,
    seenMessageIds
  });

  return res.json({ success: true });
};

export const messageDelivered = (req: Request, res: Response) => {
  const { senderId, messageId } = req.body;

  io.to(senderId).emit("messageDelivered", { messageId });

  return res.json({ success: true });
};

export const bulkDelivered = (req: Request, res: Response) => {
  const { senderId, messageIds } = req.body;

  io.to(senderId).emit("bulkDelivered", { messageIds });

  return res.json({ success: true });
};



export const checkUserOnline = (req: Request, res: Response) => {

  const { userId } = req.body;

  const online = onlineUsers.has(userId);

  return res.json({
    online
  });
};