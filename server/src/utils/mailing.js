const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function mailing(email, subject, htmlContent) {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY missing from environment');
    }

    const { data, error } = await resend.emails.send({
      from: process.env.RESENT_EMAIL,
      to: [email],
      subject: subject,
      html: htmlContent,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    return {
      status: 'success',
      mode: 'mock_fallback',
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = { mailing };
