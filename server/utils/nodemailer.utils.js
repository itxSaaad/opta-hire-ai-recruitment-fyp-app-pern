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
    throw new Error('Error sending email');
  }
});

/**
 * @desc Generates a universal HTML email template. This template is adaptable to various use cases (OTP, CTA, headings, lists, etc.)
 * by passing an array of content blocks.
 *
 * @param {Object} params - Dynamic parameters for the email.
 * @param {string} params.brandName - Company/Brand name (default: "OptaHire").
 * @param {string} params.firstName - Recipient's first name.
 * @param {string} params.subject - Email subject.
 * @param {Object[]} params.content - Array of content blocks.
 *        Each block must include:
 *          - type: 'text', 'heading', 'otp', 'cta', or 'list'
 *          - value: string (for text, otp, heading) or object (for cta: { link, text }) or array (for list)
 * @param {Object} [params.branding] - Branding options.
 * @param {string} [params.branding.primaryColor] - Primary brand color.
 * @param {string} [params.branding.secondaryColor] - Secondary brand color.
 * @param {string} [params.branding.logo] - Logo URL.
 * @param {string} [params.footerText] - Custom footer text.
 * @param {number} [params.year] - Footer copyright year.
 *
 * @returns {string} HTML email template.
 */

const generateEmailTemplate = ({
  brandName = 'OptaHire',
  firstName,
  subject,
  content = [],
  branding = {
    primaryColor: '#0EB0E3',
    secondaryColor: '#3946AE',
    logo: null,
  },
  footerText = 'Optimizing Your Recruitment Journey',
  year = new Date().getFullYear(),
}) => {
  const renderContent = (content) => {
    return content
      .map((block) => {
        switch (block.type) {
          case 'text':
            return `<p class="content">${block.value}</p>`;
          case 'heading':
            return `<h2 class="subheader">${block.value}</h2>`;
          case 'otp':
            return `<div class="otp" role="textbox" aria-label="One-Time Password">${block.value}</div>`;
          case 'cta':
            return `
              <div style="text-align: center;">
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
      <title>${subject}</title>
      <style>
        :root {
          --primary: ${branding.primaryColor};
          --secondary: ${branding.secondaryColor};
          --text: #1A1A1A;
          --border: #E0E0E0;
          --background: #FFFFFF;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: var(--text);
          background-color: #f4f4f4;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: var(--background);
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .header {
          text-align: center;
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--secondary);
          margin-bottom: 1.5rem;
        }
        .subheader {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1rem 0;
          color: var(--secondary);
        }
        .content, .content-list { margin-bottom: 1.5rem; }
        .content-list li { margin-left: 1.5rem; }
        .otp {
          background: #F1F7FF;
          font-size: 2rem;
          font-weight: 700;
          color: var(--primary);
          text-align: center;
          margin: 1.5rem 0;
          padding: 1rem;
          border-radius: 8px;
          letter-spacing: 0.25rem;
        }
        .cta-button {
          display: inline-block;
          background: var(--primary);
          color: var(--background) !important;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          text-align: center;
          transition: background 0.2s ease;
        }
        .footer {
          text-align: center;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
          color: #718096;
          font-size: 0.875rem;
        }
      </style>
    </head>
    <body>
      <div class="container" role="main">
        <header class="header" role="banner">
          ${
            branding.logo
              ? `<img src="${branding.logo}" alt="${brandName}" style="max-height: 50px;">`
              : brandName
          }
        </header>
        <main>
          <p class="content">Hello ${firstName},</p>
          ${renderContent(content)}
        </main>
        <footer class="footer" role="contentinfo">
          <p>&copy; ${year} ${brandName}. All rights reserved.</p>
          <p>${footerText}</p>
        </footer>
      </div>
    </body>
  </html>
  `;
};

module.exports = { sendEmail, generateEmailTemplate };
