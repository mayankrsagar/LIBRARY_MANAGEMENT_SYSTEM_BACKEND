import nodemailer from 'nodemailer';

export const sendEmail = async ({ email, subject, message }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),  // ensure port is a number
    secure: Number(process.env.SMTP_PORT) === 465, // secure if 465
    service: process.env.SMTP_SERVICE, 
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.SMTP_MAIL,
    to: email,
    subject: subject,
    html: message,
  });

  return info; // optional: return the result if you want to log it
};
