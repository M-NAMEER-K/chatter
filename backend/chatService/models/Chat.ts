import mongoose, {Schema,Document} from "mongoose";


export interface IChat extends Document{
        users:string[];
        latestMessage:{
            text:string;
            sender:string;
             createdAt:Date
        },
        createdAt:Date;
        updatedAt:Date;

}

const schema :Schema<IChat>=new Schema({
      users:[{
        type:String,
        required:true
      }
      ],
      latestMessage:{
        text:String,
        sender:String,
        createdAt:Date
      },

    },
{timestamps:true});

export const Chat=mongoose.model<IChat>("Chat",schema);