'use strict';

const { timingSafeEqual } = require('crypto');
const { Router } = require('express');
const {
  processScheduledPayouts,
} = require('../controllers/payment.controller');

const router = Router();

const isAuthorizedCronRequest = (req) => {
  const secret = process.env.CRON_SECRET;
  const authorization = req.get('authorization') || '';

  if (!secret || !authorization.startsWith('Bearer ')) return false;

  const supplied = Buffer.from(authorization.slice('Bearer '.length));
  const expected = Buffer.from(secret);

  return (
    supplied.length === expected.length && timingSafeEqual(supplied, expected)
  );
};

router.get('/scheduled-payouts', async (req, res) => {
  if (!isAuthorizedCronRequest(req)) {
    return res.status(401).json({ success: false, message: 'Unauthorized.' });
  }

  if (process.env.DISABLE_SCHEDULED_PAYOUTS === 'true') {
    return res.status(200).json({
      success: true,
      skipped: true,
      reason: 'Scheduled payouts are disabled by configuration.',
    });
  }

  try {
    const result = await processScheduledPayouts();
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Scheduled payout cron failed:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Scheduled payout job failed.' });
  }
});

module.exports = router;
