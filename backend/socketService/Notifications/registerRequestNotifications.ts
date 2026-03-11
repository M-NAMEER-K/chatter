import { Server } from "socket.io";
import { AuthSocket } from "../middlewares/isAuth";

export const registerRequestNotifications = (io: Server, socket: AuthSocket) => {

  socket.on("sendFriendRequest", (data) => {
    console.log("Friend request sent:", data);
  });

  socket.on("acceptFriendRequest", (data) => {
    console.log("Friend request accepted:", data);
  });

  socket.on("rejectFriendRequest", (data) => {
    console.log("Friend request rejected:", data);
  });

};
