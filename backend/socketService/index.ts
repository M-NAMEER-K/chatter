import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import setupSocket from "./socket/setupSocket";
import requestRoute from "./routes/requestNotification"
import profileRoute from "./routes/profileNotification"
import messageRoute from "./routes/messageNotification"

dotenv.config();
const PORT = process.env.PORT || 3003;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "https://chatter-seven-blue.vercel.app",
  "http://localhost:5173"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.options("*", cors()); 

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});
app.use("/api/v1",requestRoute);
app.use("/api/v1",profileRoute);
app.use("/api/v1", messageRoute);

setupSocket(io);

 

server.listen(PORT, () => {
  console.log(`Socket Service running on port : ${PORT}`);
});
