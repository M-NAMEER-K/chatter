import nodemailer from "nodemailer";

export const mailSender = async (
  email: string,
  subject: string,
  body: string | number
): Promise<void> => {

  const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL,
    pass: process.env.PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

  await transporter.sendMail({
    from: `"RapidTalk" <${process.env.GMAIL}>`,
    to: email,
    subject,
     html: `${body}`
  });
};
