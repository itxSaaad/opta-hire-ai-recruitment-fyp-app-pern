const asyncHandler = require('express-async-handler');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.NODE_ENV === 'production' ? true : false,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendEmail = asyncHandler(async (options) => {
  try {
    const response = await transporter.sendMail(options);

    return response;
  } catch (error) {
    console.error(`Error Sending Email: ${error}`);
    throw new Error('Error sending email');
  }
});

module.exports = sendEmail;
