import { io } from "socket.io-client";
const BASE_URL3=import.meta.env.VITE_API_URL3 || "http://localhost:3003";

export const socket = io(BASE_URL3, {
  withCredentials: true,
  autoConnect: false,


  // 🔥 ADD THESE
  reconnection: true,
  
  auth: (cb) => {
    cb({
      token: localStorage.getItem("token")
    });
  }
});
  // 🔥 When socket connects or reconnects
socket.on("connect", () => {
  console.log("Socket connected:", socket.id);

  // Tell server to check pending deliveries
  socket.emit("userOnlineSync");
   socket.emit("requestOnlineUsers");
});

// 🔥 If internet comes back
window.addEventListener("online", () => {
  if (!socket.connected) {
    console.log("Internet restored. Reconnecting socket...");
    socket.connect();
  }
});
socket.on("connect_error", (err) => {

  if (err.message === "Unauthorized") {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    socket.disconnect();

    window.location.href = "/login";

  }

});


