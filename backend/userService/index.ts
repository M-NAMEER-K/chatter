import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/database"
import cors from "cors"
 //import { createClient } from "redis";
import userRoute from "./routes/User"
import requestRoute from "./routes/request"
import cookieParser from "cookie-parser"


dotenv.config();




const PORT=3000;
const app=express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);



connectDB();

app.use("/api/v1", userRoute);
app.use("/api/v1",requestRoute);


 /*export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

redisClient
  .connect()
  .then(() => console.log("Redis connected"))
  .catch((err) => console.error("Redis not connected", err));*/



app.listen(PORT, () => {
  console.log(`User Service running on PORT:${PORT}`);
});





