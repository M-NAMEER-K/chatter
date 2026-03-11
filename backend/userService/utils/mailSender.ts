import nodemailer from "nodemailer";

export const mailSender = async (
  email: string,
  subject: string,
  body: string | number
): Promise<void> => {

  const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
  port: 465,
  secure: true,
    auth: {
      user: process.env.GMAIL!,
      pass: process.env.PASS!,
    },
  });

  await transporter.sendMail({
    from: `"RapidTalk" <${process.env.GMAIL}>`,
    to: email,
    subject,
     html: `${body}`
  });
};
