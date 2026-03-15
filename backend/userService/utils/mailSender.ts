import emailjs from "@emailjs/nodejs";
import dotenv from "dotenv";

dotenv.config();

export const mailSender = async (
  templateId: string,
  templateParams: Record<string, any>
): Promise<void> => {
  try {
      const res= await emailjs.send(
      process.env.EMAILJS_SERVICE_ID as string,
      templateId,
      templateParams,
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY as string,
        privateKey: process.env.EMAILJS_PRIVATE_KEY as string,
      }
    );
    console.log(res);
  } catch (error) {
    console.error("EmailJS Error:", error);
    throw error;
  }
};