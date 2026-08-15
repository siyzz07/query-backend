export const EMAIL_TEMPLATES = {
  OTP: {
    SUBJECT: 'Your Login Verification OTP',
    HTML: (otp: string) => `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #4f46e5; margin-bottom: 20px;">Console Board Authentication</h2>
        <p style="font-size: 14px; color: #334155; line-height: 1.5;">
          Your login OTP verification code is:
        </p>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; color: #0f172a; letter-spacing: 4px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="font-size: 12px; color: #64748b;">
          This OTP is valid for 5 minutes. If you did not request this login, please ignore this email.
        </p>
      </div>
    `
  }
};
