 
 export const otpTemplate = (otp: number, name?: string) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Welcome to RapidTalk 👋</h2>

      ${name ? `<p>Hi <strong>${name}</strong>,</p>` : ""}

      <p>Your OTP for account verification is:</p>

      <h1 style="letter-spacing: 4px;">${otp}</h1>

      <p>This OTP is valid for <strong>1 minute</strong>.</p>

      <p>If you didn’t request this, please ignore this email.</p>

      <br />
      <p>— RapidTalk Team</p>
    </div>
  `;
};
