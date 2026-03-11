import mongoose,{Schema,Document} from "mongoose"


export interface IOtp extends Document{
    email:string,
    name:string,
    otp:number,
    password:string,
    expiresAt:Date
}



const otpSchema:Schema<IOtp>=new Schema({
      email:
      {type:String,
      required:true,
      unique:true}
      ,
      name:{
       type:String,
       required:true,
      },
      otp:{
         type:Number,
         required:true
      },
      password:{
        type:String,
        required:true
      },
      expiresAt:{
          type:Date,
          default:Date.now(),
          expires:300
      }
},
{timestamps:true});

export const Otp=mongoose.model<IOtp>("Otp",otpSchema);


