export const resetPasswordTemplate = (resetURL: string) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Password Reset Request 🔐</h2>

      <p>We received a request to reset your password.</p>

      <p>Click the button below to reset it:</p>

      <a 
        href="${resetURL}" 
        style="
          display: inline-block;
          padding: 10px 20px;
          background-color: #facc15;
          color: #000;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        "
      >
        Reset Password
      </a>

      <p style="margin-top: 10px;">
        This link expires in <strong>15 minutes</strong>.
      </p>

      <p>If you didn’t request this, you can safely ignore this email.</p>

      <br />
      <p>— RapidTalk Security Team</p>
    </div>
  `;
};
