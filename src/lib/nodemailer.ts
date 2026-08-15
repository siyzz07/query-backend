import nodemailer from 'nodemailer';
import envConfig from '../config/env.config';

const transporter = nodemailer.createTransport({
  host: envConfig.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(envConfig.SMTP_PORT || '587', 10),
  secure: envConfig.SMTP_PORT === '465', 
  auth: {
    user: envConfig.SMTP_USER,
    pass: envConfig.SMTP_PASS,
  },
});

export const sendMail = async (to: string, subject: string, html: string): Promise<void> => {
  const mailOptions = {
    from: envConfig.SMTP_FROM || `"Console Board" <no-reply@query.com>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};
