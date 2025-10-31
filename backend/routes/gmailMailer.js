require('dotenv').config();
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground' // redirect URI
);

oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

async function ensureValidAccessToken() {
  try {
    // Attempt to get a fresh access token
    const tokenResponse = await oAuth2Client.getAccessToken();
    if (!tokenResponse?.token) throw new Error('Failed to refresh access token');
    return tokenResponse.token;
  } catch (err) {
    console.error('⚠️ Failed to refresh Gmail access token:', err.message);
    throw new Error(
      'Gmail refresh token may be expired or revoked. Reauthorize the app to get a new one.'
    );
  }
}

async function sendEmail(to, subject, html) {
  try {
    const accessToken = await ensureValidAccessToken();

    const gmail = google.gmail({
      version: 'v1',
      auth: oAuth2Client,
    });

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
    if (error.message.includes('invalid_grant')) {
      console.error(
        '❌ Gmail refresh token has expired or been revoked. You must reauthorize and update the refresh token.'
      );
    } else {
      console.error('❌ Error sending email via Gmail API:', error);
    }
  }
}

module.exports = { sendEmail };
