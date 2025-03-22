const asyncHandler = require('express-async-handler');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config();

/**
 * @desc Creates a nodemailer transporter for sending emails.
 *
 * @type {Object}
 * @property {string} service - The email service to use.
 * @property {string} host - The email host to use.
 * @property {number} port - The email port to use.
 * @property {boolean} secure - Whether to use a secure connection.
 * @property {Object} auth - The authentication credentials for the email service.
 * @property {string} auth.user - The email address to use for sending emails.
 * @property {string} auth.pass - The password to use for sending emails.
 *
 * @returns {Object} The nodemailer transporter object.
 */

const transporter = nodemailer.createTransport({
  service: process.env.NODEMAILER_SMTP_SERVICE,
  host: process.env.NODEMAILER_SMTP_HOST,
  port: process.env.NODEMAILER_SMTP_PORT,
  secure: process.env.NODE_ENV === 'production' ? true : false,
  auth: {
    user: process.env.NODEMAILER_SMTP_EMAIL,
    pass: process.env.NODEMAILER_SMTP_PASSWORD,
  },
});

/**
 * @desc Sends an email using the nodemailer transporter.
 *
 * @param {Object} options - Email options for sending an email.
 * @param {string} options.from - The sender's email address.
 * @param {string} options.to - The recipient's email address.
 * @param {string} options.subject - The email subject.
 * @param {string} options.html - The email content in HTML format.
 *
 * @returns {Promise<Object>} The response from the nodemailer transporter.
 */

const sendEmail = asyncHandler(async (options) => {
  try {
    const response = await transporter.sendMail(options);

    return response;
  } catch (error) {
    console.error(`Error Sending Email: ${error}`);
    throw new Error(
      'Unable to send email notification. Please check your network connection and try again later.'
    );
  }
});

/**
 * @desc Generates a universal HTML email template. This template is adaptable to various use cases (OTP, CTA, headings, lists, etc.)
 * by passing an array of content blocks.
 *
 * @param {Object} params - Dynamic parameters for the email.
 * @param {string} params.firstName - The recipient's first name.
 * @param {string} params.subject - The email subject.
 * @param {Object[]} params.content - An array of content blocks for the email.
 * @param {string} params.content[].type - The type of content block (text, heading, otp, cta, list).
 * @param {string} params.content[].value - The value of the content block.
 *
 * @returns {string} HTML email template.
 */

const generateEmailTemplate = ({ firstName, subject, content = [] }) => {
  const renderContent = (content) => {
    return content
      .map((block) => {
        switch (block.type) {
          case 'text':
            return `<p class="content">${block.value}</p>`;
          case 'heading':
            return `<h2 class="subheader">${block.value}</h2>`;
          case 'otp':
            return `<div class="highlight" role="textbox" aria-label="One-Time Password">${block.value}</div>`;
          case 'cta':
            return `
              <div style="text-align: center; margin-top: 30px;">
                <a href="${block.value.link}" class="cta-button" role="button">${block.value.text}</a>
              </div>`;
          case 'list':
            return `
              <ul class="content-list">
                ${block.value.map((item) => `<li>${item}</li>`).join('')}
              </ul>`;
          default:
            return '';
        }
      })
      .join('');
  };

  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light">
      <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <meta name="apple-mobile-web-app-title" content="OptaHire" />
      <link rel="manifest" href="/site.webmanifest" />
      <title>${subject}</title>
      <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
      <style>
        :root {
          --primary: #0eb0e3;
          --secondary: #3946ae;
          --text: #1a1a1a;
          --border: #e0e0e0;
          --background: #ffffff;
          --heading-font: 'Hanken Grotesk', sans-serif;
          --body-font: 'Inter', sans-serif;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: var(--body-font);
          line-height: 1.6;
          color: var(--text);
          background-color: #f4f4f4;
          -webkit-font-smoothing: antialiased;
          padding: 20px;
        }
        .container {
          max-width: 700px;
          margin: 40px auto;
          background: var(--background);
          padding: 3rem;
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
          border: 1px solid var(--border);
        }
        .header-container {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2.5rem;
          border-bottom: 2px solid var(--border);
          padding-bottom: 1rem;
        }
        .logo {
          max-width: 100px;
          height: auto;
          margin-right: 20px;
        }
        .header {
          text-align: left;
          font-family: var(--heading-font);
          border-bottom: none;
        }
        .header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--secondary);
          letter-spacing: 0.5px;
        }
        .subheader {
          font-family: var(--heading-font);
          color: var(--primary);
          font-size: 1.4rem;
          margin: 2rem 0 1.5rem;
          font-weight: 600;
          padding-left: 1rem;
          padding: 0.8rem 1rem;
          border-left: 5px solid var(--primary);
          background: rgba(14, 176, 227, 0.05);
          border-radius: 0 8px 8px 0;
        }
        .header-subheader {
          font-family: var(--heading-font);
          color: var(--primary);
          font-size: 1rem;
          font-weight: 500;
          text-align: left;
        }
        .content {
          color: var(--text);
          font-size: 1.1rem;
          margin-bottom: 1.5rem;
          line-height: 1.8;
        }
        .content-list {
          margin: 1.5rem 0;
          padding-left: 2rem;
        }
        .content-list li {
          margin: 0.8rem 0;
          color: var(--text);
          font-size: 1.1rem;
        }
        .highlight {
          background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
          font-size: 1.5rem;
          padding: 1.5rem;
          margin: 2rem 0;
          border-radius: 8px;
          border: 2px solid var(--primary);
          text-align: center;
          font-weight: 600;
          color: var(--secondary);
        }
        .cta-button {
          display: inline-block;
          background-color: var(--secondary);
          color: white !important;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .cta-button:hover {
          background-color: var(--primary);
          transform: translateY(-2px);
          box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
        }
        .footer {
          font-family: var(--body-font);
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 2px solid var(--border);
          text-align: center;
          color: #666;
          font-size: 0.9rem;
        }
        @media (max-width: 768px) {
          .container {
            padding: 2rem;
          }
          .header-container {
            flex-direction: column;
          }
          .logo {
            margin-right: 0;
            margin-bottom: 15px;
          }
          .header,
          .subheader,
          .header-subheader {
            text-align: center;
          }
          .cta-button {
            width: 80%;
            text-align: center;
          }
        }
      </style>
    </head>
    <body>
      <div class="container" role="main">
        <header class="header-container">
          <img src="assets/logo.png" alt="OptaHire Logo" class="logo" />
          <div class="header" role="banner">
            <h1>OptaHire</h1>
            <h3 class="header-subheader">Optimizing Your Recruitment Journey</h3>
          </div>
        </header>
        <main>
          <p class="content">Hello ${firstName},</p>
          ${renderContent(content)}
          <p class="content">Thank you for choosing OptaHire. If you have any questions or need further assistance, please don't hesitate to contact us at <a href="mailto:optahire@gmail.com" style="color: var(--primary); text-decoration: none">optahire@gmail.com</a>.</p>
          <p class="content">Best Regards,<br />The OptaHire Team</p>
        </main>
        <footer class="footer" role="contentinfo">
          <p>
            Visit <a href="https://opta-hire-fyp-app-client.vercel.app" style="color: var(--primary); text-decoration: none">OptaHire</a> to experience the full platform.
          </p>
          <p>&copy; ${new Date().getFullYear()} OptaHire | Optimizing Your Recruitment Journey</p>
        </footer>
      </div>
    </body>
  </html>
  `;
};

module.exports = { sendEmail, generateEmailTemplate };
