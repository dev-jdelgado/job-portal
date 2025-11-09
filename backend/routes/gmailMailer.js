// gmailMailer.js
require('dotenv').config();
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

// === Token cache ===
let cachedAccessToken = null;
let cachedExpiryTime = 0;

async function ensureValidAccessToken() {
  const now = Date.now();
  if (!cachedAccessToken || now >= cachedExpiryTime) {
    try {
      const tokenResponse = await oAuth2Client.getAccessToken();
      if (!tokenResponse?.token) throw new Error('Failed to refresh access token');

      cachedAccessToken = tokenResponse.token;
      cachedExpiryTime = now + 55 * 60 * 1000; // refresh 5 min early
      console.log('🔑 Refreshed Gmail access token');
    } catch (err) {
      console.error('⚠️ Failed to refresh Gmail access token:', err.message);
      throw new Error('Gmail refresh token may be expired or revoked.');
    }
  }
  return cachedAccessToken;
}

/**
 * Send email with Gmail API (supports HTML + plain text)
 * @param {string} to Recipient email
 * @param {string} subject Email subject
 * @param {string} html HTML content
 * @param {string} [text] Optional plain text fallback
 */
async function sendEmail(to, subject, html, text = '') {
  try {
    await ensureValidAccessToken();
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const plainText = text || html.replace(/<[^>]+>/g, ''); // strip HTML if no text provided

    const messageParts = [
      `From: "SkillLink Job Portal" <${process.env.GMAIL_USER}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: multipart/alternative; boundary="boundary123"',
      '',
      '--boundary123',
      'Content-Type: text/plain; charset="UTF-8"',
      'Content-Transfer-Encoding: 7bit',
      '',
      plainText,
      '',
      '--boundary123',
      'Content-Type: text/html; charset="UTF-8"',
      'Content-Transfer-Encoding: 7bit',
      '',
      html,
      '',
      '--boundary123--'
    ];

    const message = messageParts.join('\r\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage }
    });

    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    if (error.message.includes('invalid_grant')) {
      console.error('❌ Gmail refresh token expired or revoked. Reauthorize the app.');
    } else {
      console.error('❌ Error sending email via Gmail API:', error);
    }
  }
}

module.exports = { sendEmail };
