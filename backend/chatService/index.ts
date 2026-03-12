import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/database"
import cookieParser from "cookie-parser"
import cors from "cors"
import chatRoute from "./routes/chat"


dotenv.config();




const PORT=process.env.PORT || 3001;
const app=express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use("/api/v1",chatRoute);



connectDB();



app.listen(PORT,()=>{
      console.log(`App is listening on PORT:${PORT}`);
});


