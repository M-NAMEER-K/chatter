<<<<<<< HEAD
import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();
const resend = new Resend(process.env.RESEND_API);
=======
import emailjs from "@emailjs/nodejs";
import dotenv from "dotenv";

dotenv.config();
>>>>>>> 369022d (install axios)

export const mailSender = async (
  templateId: string,
  templateParams: Record<string, any>
): Promise<void> => {
<<<<<<< HEAD
  await resend.emails.send({
    from: "RapidTalk <onboarding@resend.dev>",
    to: email,
    subject,
    html: `${body}`
  });
};
=======
  try {
    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID as string,
      templateId,
      templateParams,
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY as string,
        privateKey: process.env.EMAILJS_PRIVATE_KEY as string,
      }
    );
  } catch (error) {
    console.error("EmailJS Error:", error);
    throw error;
  }
};
>>>>>>> 369022d (install axios)
