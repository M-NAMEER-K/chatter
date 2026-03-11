import mongoose , {Schema,Document} from "mongoose"

export interface IUser extends Document{
      name:string,
      email:string,
      password:string,
      friends:mongoose.Types.ObjectId[],
       isFriend:boolean,
      profileImage:{
         url:string,
         publicId:string
      }, 
      lastSeen:Date,
        resetPasswordToken?: string,
        resetPasswordExpires?: Date,
       
} 

const schema:Schema<IUser>=new Schema({
     name:{
        type:String,
        unique: true,
        required:[true,"username is required"],
         minlength: [5, "Username must be at least 5 characters"],
         maxlength: [20, "Username must not exceed 20 characters"],
     },
     email:{
         type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
     },
     password:{
      type:String,
      required:[true,"password is required"],
       minlength: [8, "Password must be at least 8 characters"],
      select: false
     },
     
     friends: [
  {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
],
isFriend:{                 
type:Boolean,
default:true
},
profileImage: {
  url: {
    type: String,
    default: "",
  },
  publicId: {
    type: String,
    default: "",
  },
},
lastSeen: {
  type: Date,
  default: null
}
,resetPasswordToken: {
  type: String,
},
resetPasswordExpires: {
  type: Date,
}

},
{
    timestamps:true
}
)
export const User=mongoose.model<IUser>("User",schema);