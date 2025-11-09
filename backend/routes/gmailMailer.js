require('dotenv').config();
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground' // redirect URI
);

oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

// === Token cache to prevent repeated slow refresh calls ===
let cachedAccessToken = null;
let cachedExpiryTime = 0;

async function ensureValidAccessToken() {
  const now = Date.now();
  if (!cachedAccessToken || now >= cachedExpiryTime) {
    try {
      const tokenResponse = await oAuth2Client.getAccessToken();
      if (!tokenResponse?.token) throw new Error('Failed to refresh access token');

      cachedAccessToken = tokenResponse.token;
      // Gmail tokens usually last 3600 seconds (1 hour)
      cachedExpiryTime = now + 55 * 60 * 1000; // refresh 5 minutes early

      console.log('🔑 Refreshed Gmail access token');
    } catch (err) {
      console.error('⚠️ Failed to refresh Gmail access token:', err.message);
      throw new Error(
        'Gmail refresh token may be expired or revoked. Reauthorize the app to get a new one.'
      );
    }
  }
  return cachedAccessToken;
}

// === Non-blocking Gmail send ===
async function sendEmail(to, subject, html) {
  try {
    await ensureValidAccessToken();

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

    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    if (error.message.includes('invalid_grant')) {
      console.error(
        '❌ Gmail refresh token expired or revoked. Please reauthorize and update it.'
      );
    } else {
      console.error('❌ Error sending email via Gmail API:', error);
    }
  }
}

module.exports = { sendEmail };
