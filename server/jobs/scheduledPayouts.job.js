'use strict';

const cron = require('node-cron');

const startScheduledPayoutCron = () => {
  // Vercel invokes the authenticated HTTP route from vercel.json. A process
  // timer is opt-in for a persistent host such as EC2 or a local server.
  if (
    process.env.VERCEL === '1' ||
    process.env.ENABLE_LOCAL_SCHEDULED_PAYOUTS !== 'true' ||
    process.env.DISABLE_SCHEDULED_PAYOUTS === 'true'
  ) {
    return null;
  }

  const schedule = process.env.SCHEDULED_PAYOUTS_CRON || '0 5 * * *';
  if (!cron.validate(schedule)) {
    throw new Error(`Invalid SCHEDULED_PAYOUTS_CRON expression: ${schedule}`);
  }

  return cron.schedule(
    schedule,
    async () => {
      try {
        const {
          processScheduledPayouts,
        } = require('../controllers/payment.controller');
        await processScheduledPayouts();
      } catch (error) {
        console.error('Scheduled payout cron failed:', error);
      }
    },
    {
      timezone: process.env.SCHEDULED_PAYOUTS_TIMEZONE || 'UTC',
      noOverlap: true,
    }
  );
};

module.exports = startScheduledPayoutCron;
