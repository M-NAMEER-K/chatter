import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();
const resend = new Resend(process.env.RESEND_API);

export const mailSender = async (
  email: string,
  subject: string,
  body: string | number
): Promise<void> => {
  await resend.emails.send({
    from: "RapidTalk <onboarding@resend.dev>",
    to: email,
    subject,
    html: `${body}`
  });
};
