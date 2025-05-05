// utils/notifyCron.js
import cron from 'node-cron';

import Borrow from '../models/borrowModel.js';
import { generateBorrowEmailTemplate } from '../utils/emailTemplates.js';
import { sendEmail } from '../utils/sendEmail.js';

/**
 * Runs every 30 minutes to notify users of overdue borrowed books.
 */
export const notifyUsers = () => {
  cron.schedule('*/30 * * * *', async () => {
    try {
      // Calculate 24 hours ago
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Find borrows that are overdue, not returned, and not yet notified
      const overdueBorrows = await Borrow.find({
        dueDate: { $lt: oneDayAgo },
        returnDate: null,
        notified: false,
      })

      for (const borrow of overdueBorrows) {
        const { user, bookTitle, dueDate, _id } = borrow;
        if (!user || !user.email) continue;

        // Generate personalized message
        const message = generateBorrowEmailTemplate({
          userName: user.name,
          bookTitle,
          dueDate,
          borrowId: _id,
        });
        // Send email
        await sendEmail({
          email: user.email,
          subject: 'Reminder: Please Return Your Borrowed Book',
          message,
        });

        // Mark as notified so we don't resend
        borrow.notified = true;
        await borrow.save();
      }
    } catch (err) {
      console.error('Error in notifyUsers cron job:', err);
    }
  });
};
