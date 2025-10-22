// gmailMailer.js
require('dotenv').config();
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground' // redirect URI
);

oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

async function sendEmail(to, subject, html) {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const messageParts = [
      `From: "Job Portal" <${process.env.GMAIL_USER}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      html,
    ];

    const message = messageParts.join('\n');
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    });

    console.log('✅ Email sent successfully via Gmail API');
  } catch (error) {
    console.error('❌ Error sending email via Gmail API:', error);
    throw error;
  }
}

module.exports = { sendEmail };
