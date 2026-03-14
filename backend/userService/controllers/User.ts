import {Request,Response} from "express"
//import {redisClient} from "../index"
import { Otp } from "../models/Otp";
import {User,IUser} from "../models/User"
import {mailSender} from "../utils/mailSender"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import {resetPasswordTemplate} from "../mailTemplates/ResetPassword"
import {otpTemplate} from "../mailTemplates/Otp"
import { AuthenticatedRequest } from "../middlewares/isAuth";

export const sendOtp=async(req:Request,res:Response):Promise<Response>=>{
      try{

            const {email,password,name}=req.body;
           
          /* const rateLimitKey=`otp:ratelimit:${email}`;
             const rateLimit=await redisClient.get(rateLimitKey);
    if(rateLimit){
        return res.status(400).json({
               success:false,
               message:"Too many request.Wait till requesting new otp"
        });
    }*/
        if(!email || !password ||!name){
          return res.status(400).json({
             success:false,
             message:"Provide all details"
          });
        }
    const user:IUser|null=await User.findOne({email});

    if(user){
      return res.status(400).json({
             success:false,
             message:"User is already registered with this email"
      });
    }
   const otp: number = Math.floor(100000 + Math.random() * 900000);

      const prevOtp=await Otp.findOne({
        email
      });

      if(prevOtp){
          await prevOtp.deleteOne();

      }
             
      
      
     
        const hashedPassword = await bcrypt.hash(password, 10);
       // await redisClient.set(rateLimitKey, "true", { EX: 60 });

try {
      await mailSender(
        email,
        "RapidTalk - Email Verification",
        otpTemplate(otp, name)
      );
    } catch (err:any) {
      console.error("Email sending error:", err);
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
        await Otp.create({
              email,otp,name,password:hashedPassword,
               expiresAt: new Date(Date.now() + 60 * 1000)
         });
       return res.status(200).json({
          success:true,
          message:"Otp send to your mail"
       });
      }  
      catch(err:any){
           console.log(err);
           return res.status(400).json({
            success:false,
            message:err.message
           });
      }  
   
        
}

export const resendOtp = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = req.body;

    /*const rateLimitKey = `otp:ratelimit:${email}`;
    if (await redisClient.get(rateLimitKey)) {
      return res.status(429).json({
        success: false,
        message: "Too many requests",
      });
    }*/

    const otpDoc = await Otp.findOne({ email });
    if (!otpDoc) {
      return res.status(404).json({
        success: false,
        message: "OTP not found",
      });
    }

    otpDoc.otp = Math.floor(100000 + Math.random() * 900000);
    otpDoc.expiresAt = new Date(Date.now() + 60 * 1000);
    await otpDoc.save();

    //await redisClient.set(rateLimitKey, "true", { EX: 60 });
    await mailSender(email, "RapidTalk", otpDoc.otp);

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
    });
  }
};

export const registerUser=async(req:Request,res:Response):Promise<Response>=>{
  try{ 
       
  const {email,otp}=req.body;
  const haveOtp=await Otp.findOne({email,otp});
          
    if(!haveOtp){
        return res.status(404).json({
           success:false,
           message:"Invalid Otp"
        });
    }
      if (haveOtp.expiresAt < new Date()) {
      await haveOtp.deleteOne();
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }
         
          await User.create({
                email,
                name:haveOtp.name,
                password:haveOtp.password
          });
          
            await haveOtp.deleteOne();
            
       return res.status(200).json({
           success:true,
           message:"User registered successfully "
       });
}
catch(err){
      console.log(err);
      return res.status(400).json({
          success:false,
          message:"User not registered"
      });
  }
}

export const loginUser=async(req:Request,res:Response):Promise<Response>=>{
            
  
  try{
           
  const {email,password}=req.body;
       
  if(!email ||!password){
       return res.status(400).json({
           success:false,
           message:"Provide all details"
       });
  }

      const user = await User.findOne({ email }).select("+password");
       if(!user){
            return res.status(404).json({
                 success:false,
                 message:"user has not registered yet"
            });
       }
            const result=await bcrypt.compare(password,user.password);
            if(!result){
                 return res.status(400).json({
                    success:false,
                    message:"You entered wrong password"
                 });
            }
              const payload={
                  _id:user._id.toString(),
                  email:user.email,
                  name:user.name

              }
              const token=jwt.sign(payload,process.env.SECRET_KEY as string,{expiresIn:"1d"});
              
              res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
      const userData={name:user.name,email:user.email,_id:user._id}
            return res.status(200).json({
                 success:true,
                 message:"Login successful"
                 ,data:{token,userData}
            });
  }
  catch(err){
       console.log(err);
       return res.status(400).json({
           success:false,
           message:"Login Failed"
       });
  }

}
export const logoutUser=async(req:Request,res:Response):Promise<Response>=>{
         
        res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });

}


export const forgotPassword=async(req:Request,res:Response):Promise<Response>=>{
        const {email}=req.body;
           
          const user=await User.findOne({email});
          if(!user){
              return res.status(400).json({
                  success:false,
                  message:"User is not registered with this email"
              });
          }
          
           const resetToken = crypto.randomBytes(32).toString("hex");

  // 2️⃣ Hash token before saving
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // 3️⃣ Save to DB
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  await user.save();

  // 4️⃣ Email link
  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

 await mailSender( email, "Reset Your Password", resetPasswordTemplate(resetURL));

  return res.status(200).json({
    success: true,
    message: "Password reset link sent to your email",
  });

         
          
}


export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Token is invalid or expired",
    });
  }

  // Hash new password
  user.password = await bcrypt.hash(password, 10);

  // Clear reset fields
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
};


export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
     console.log("checking your validity");
    const userId = req.user?._id; // comes from cookie auth middleware

    const user = await User.findById(userId).select("-password");

    return res.json({
      success: true,
      user
    });

  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }
};
