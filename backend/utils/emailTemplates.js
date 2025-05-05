// utils/emailTemplates.js

/**
 * Generates an HTML email template for OTP verification.
 * @param {number|string} code - The verification OTP code
 * @returns {string} HTML string for the email body
 */
export function generateVerificationOtpEmailTemplate(code) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Verify Your Email</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #333333;
          font-size: 24px;
        }
        p {
          color: #555555;
          line-height: 1.5;
        }
        .otp-code {
          display: inline-block;
          margin: 20px 0;
          padding: 10px 20px;
          font-size: 20px;
          color: #ffffff;
          background-color: #007BFF;
          border-radius: 4px;
          text-decoration: none;
        }
        .footer {
          font-size: 12px;
          color: #999999;
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Email Verification</h1>
        <p>Thank you for registering with Bookworm Library Management System.</p>
        <p>Please use the following One-Time Password (OTP) to verify your email address:</p>
        <div class="otp-code">${code}</div>
        <p>This OTP is valid for 15 minutes. If you did not request this code, please ignore this email.</p>
        <p>Happy reading,<br/>The Bookworm Library Team</p>
        <div class="footer">
          <p>Bookworm Library Management System</p>
          <p>&copy; ${new Date().getFullYear()} Bookworm Library</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }
  

  export function generateForgotPasswordEmailTemplate(resetUrl, email) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Reset Your Password</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
        h1 { color: #333333; font-size: 24px; }
        p { color: #555555; line-height: 1.5; }
        .reset-button { display: inline-block; margin: 20px 0; padding: 12px 24px; font-size: 18px; color: #ffffff; background-color: #28a745; border-radius: 4px; text-decoration: none; }
        .footer { font-size: 12px; color: #999999; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Password Reset Request</h1>
        <p>Hello ${email},</p>
        <p>We received a request to reset your password for your Bookworm Library account. Click the button below to reset it:</p>
        <a href="${resetUrl}" class="reset-button">Reset Password</a>
        <p>If you did not request this, please ignore this email. This link will expire in 15 minutes.</p>
        <p>Thanks,<br/>The Bookworm Library Team</p>
        <div class="footer">
          <p>Bookworm Library Management System</p>
          <p>&copy; ${new Date().getFullYear()} Bookworm Library</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }


/**
 * Generates an HTML email template for overdue book reminders.
 * @param {{ userName: string, bookTitle: string, dueDate: Date, borrowId: ObjectId }} data
 * @returns {string} HTML string for the overdue book email body
 */
export function generateBorrowEmailTemplate({ userName, bookTitle, dueDate, borrowId }) {
  const formattedDate = new Date(dueDate).toLocaleDateString();
  const borrowLink = `${process.env.FRONTEND_URL}/borrow/${borrowId}`;

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Overdue Book Reminder</title>
    <style>
      body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 40px auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      h1 { color: #333; font-size: 24px; }
      p { color: #555; line-height: 1.5; }
      .link-button { display: inline-block; margin: 20px 0; padding: 12px 24px; font-size: 16px; color: #fff; background-color: #dc3545; border-radius: 4px; text-decoration: none; }
      .footer { font-size: 12px; color: #999; margin-top: 30px; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Overdue Book Reminder</h1>
      <p>Hi ${userName},</p>
      <p>Our records show that “<strong>${bookTitle}</strong>” was due on ${formattedDate} and has not yet been returned.</p>
      <p>Please return the book as soon as possible to avoid further penalties.</p>
      <a href="${borrowLink}" class="link-button">View Borrow Details</a>
      <p>If you’ve already returned it, please disregard this message.</p>
      <p>Thank you,<br/>Bookworm Library Team</p>
      <div class="footer">&copy; ${new Date().getFullYear()} Bookworm Library</div>
    </div>
  </body>
  </html>
  `;
}
