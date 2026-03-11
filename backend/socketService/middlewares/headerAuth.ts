 import {Request,Response,NextFunction} from "express"
import dotenv from "dotenv"
dotenv.config();

 export const headerAuth=(req:Request,res:Response,next:NextFunction)=>{

 
 
const serviceSecret = req.headers["x-service-secret"];
      console.log(serviceSecret," ",process.env.SERVICE_SECRET);
  if (serviceSecret !== process.env.SERVICE_SECRET) {
    return res.status(401).json({ message: "Unauthorized service" });
  }
     
  next();
}

