// utils/removeUnverifiedCron.js
import cron from 'node-cron';

import { User } from '../models/userModel.js';

/**
 * Every 30 minutes, delete any accounts that
 * are still unverified after 24 hours.
 */
export const removeUnverifiedAccount = () => {
  cron.schedule('*/30 * * * *', async () => {
    try {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    //   const result = 
      await User.deleteMany({
        accountVerified: false,
        createdAt:       { $lt: cutoff },
      });

    //   console.log(
    //     `[removeUnverifiedAccount] Deleted ${result.deletedCount} unverified accounts older than 24h`
    //   );
    } catch (err) {
      console.error('Error in removeUnverifiedAccount cron job:', err);
    }
  });
};
