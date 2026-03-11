import { Server } from "socket.io";
import axios from "axios";
import { socketAuth, AuthSocket } from "../middlewares/isAuth";
import { registerChatNotifications } from "../Notifications/registerChatNotifications";
import { registerRequestNotifications } from "../Notifications/registerRequestNotifications";
import dotenv from "dotenv";

export const onlineUsers = new Map<string, number>();

dotenv.config();

const setupSocket = (io: Server) => {

const disconnectTimers = new Map<string, NodeJS.Timeout>();

io.use(socketAuth);

io.on("connection", async (socket: AuthSocket) => {

  const userId = socket.user!._id;

  console.log("\n================ SOCKET CONNECT ================");
  console.log("🟢 USER CONNECTED");
  console.log("UserId:", userId);
  console.log("SocketId:", socket.id);
  console.log("================================================\n");

  socket.join(userId);

  const currentCount = onlineUsers.get(userId) || 0;

  console.log("📊 CURRENT SOCKET COUNT:", currentCount);

  onlineUsers.set(userId, currentCount + 1);

  console.log("📊 UPDATED SOCKET COUNT:", onlineUsers.get(userId));

  if (disconnectTimers.has(userId)) {
    console.log("⚠️ Found pending disconnect timer for:", userId);

    clearTimeout(disconnectTimers.get(userId)!);

    disconnectTimers.delete(userId);

    console.log("✅ Offline timer cancelled");
  }

  console.log("🧠 ONLINE USERS MAP:");
  console.log(Array.from(onlineUsers.entries()));

  console.log("📤 Sending initialOnlineUsers to:", userId);
  console.log("Online Users:", Array.from(onlineUsers.keys()));

  socket.emit("initialOnlineUsers", {
    onlineUserIds: Array.from(onlineUsers.keys())
  });

  if (currentCount === 0) {

    console.log("📢 BROADCAST userOnline");
    console.log("UserId:", userId);

    io.emit("userOnline", { userId });

  } else {

    console.log("⚠️ userOnline NOT broadcasted because user already had active socket");

  }

  console.log("🚚 Syncing pending message deliveries");

  try {

    await axios.post(
      `${process.env.CHAT_SERVICE}/api/v1/deliverPending`,
      { userId },
      {
        headers: {
          "x-service-secret": process.env.SERVICE_SECRET
        }
      }
    );

    console.log("✅ Pending delivery sync complete");

  } catch (err) {

    console.log("❌ Delivery sync failed");

  }

  registerChatNotifications(io, socket);
  registerRequestNotifications(io, socket);

  socket.on("disconnect", async () => {

    console.log("\n============== SOCKET DISCONNECT ==============");
    console.log("🔴 DISCONNECT TRIGGERED");
    console.log("UserId:", userId);
    console.log("SocketId:", socket.id);

    const count = onlineUsers.get(userId) || 0;

    console.log("📊 CURRENT SOCKET COUNT:", count);

    if (count > 1) {

      console.log("⚠️ User still has other active sockets");

      onlineUsers.set(userId, count - 1);

      console.log("📊 NEW SOCKET COUNT:", onlineUsers.get(userId));

      return;

    }

    console.log("❌ Removing user from onlineUsers map");

    onlineUsers.delete(userId);

    console.log("🧠 ONLINE USERS MAP AFTER DELETE:");
    console.log(Array.from(onlineUsers.entries()));

    console.log("⏳ Starting offline timer (1.5s)");

    const timer = setTimeout(async () => {

      console.log("\n======= OFFLINE TIMER EXECUTED =======");

      console.log("User truly offline:", userId);

      const lastSeen = new Date();

      console.log("🕒 LastSeen timestamp:", lastSeen);

      try {

        await axios.put(
          `${process.env.USER_SERVICE}/api/v1/last-seen/${userId}`,
          { lastSeen }
        );

        console.log("✅ lastSeen updated in USER SERVICE");

      } catch (err) {

        console.log("❌ Failed to update lastSeen");

      }

      console.log("📢 Broadcasting userOffline event");

      io.emit("userOffline", {
        userId,
        lastSeen
      });

      disconnectTimers.delete(userId);

      console.log("🧹 Removed disconnect timer");

      console.log("======================================\n");

    }, 1500);

    disconnectTimers.set(userId, timer);

  });

});

};

export default setupSocket;