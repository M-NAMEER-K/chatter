import { Server } from "socket.io";
import { AuthSocket } from "../middlewares/isAuth";

export const registerChatNotifications = (io: Server, socket: AuthSocket) => {

  socket.on("joinChat", (chatId: string) => {
    socket.join(chatId);
    console.log(`User ${socket.user?._id} joined chat ${chatId}`);
  });

  socket.on("leaveChat", (chatId: string) => {
    socket.leave(chatId);
    console.log(`User ${socket.user?._id} left chat ${chatId}`);
  });
  
  socket.on("typing", ({ chatId }) => {
  socket.to(chatId).emit("typing", { chatId });
});

socket.on("stopTyping", ({ chatId }) => {
  socket.to(chatId).emit("stopTyping", { chatId });
});

};
