// import nodemailer from 'nodemailer';
// import envConfig from '../config/env.config';

// const transporter = nodemailer.createTransport({
//   host: envConfig.SMTP_HOST || 'smtp.gmail.com',
//   port: parseInt(envConfig.SMTP_PORT || '587', 10),
//   secure: envConfig.SMTP_PORT === '465',
//   family: 4,
//   auth: {
//     user: envConfig.SMTP_USER || '',
//     pass: envConfig.SMTP_PASS || '',
//   },
// } as any);

// export const sendMail = async (
//   to: string,
//   subject: string,
//   html: string
// ): Promise<void> => {
//   const mailOptions = {
//     from: envConfig.SMTP_FROM || `"Console Board" <no-reply@query.com>`,
//     to,
//     subject,
//     html,
//   };

//   await transporter.sendMail(mailOptions);
// };


import { Resend } from 'resend';
import envConfig from '../config/env.config';

const resend = new Resend(envConfig.RESEND_API_KEY);

export const sendMail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  const { error } = await resend.emails.send({
    from: 'Query <onboarding@resend.dev>',
    to,
    subject,
    html,
  });

  if (error) {
    console.error('Resend email error:', error);
    throw new Error(error.message);
  }
};