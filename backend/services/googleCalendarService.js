const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];
const CREDENTIALS_PATH = path.join(__dirname, '../config/credentials.json');
const TOKEN_PATH = path.join(__dirname, '../config/token.json');

const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
const { client_secret, client_id, redirect_uris } = credentials.web;

const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// Load token and set up auto-refresh
function loadCredentials() {
  if (!fs.existsSync(TOKEN_PATH)) {
    console.error('❌ Missing token.json. Run authorize.js first.');
    process.exit(1);
  }

  const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
  oAuth2Client.setCredentials(token);

  oAuth2Client.on('tokens', (tokens) => {
    const currentToken = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    const updated = { ...currentToken, ...tokens };
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(updated, null, 2));
    console.log('🔄 Token updated and saved.');
  });
}

loadCredentials();

const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

/**
 * Creates a Google Meet event with automatic token refresh
 */
async function createMeetEvent(summary, description, attendeeEmail, startTime = new Date()) {
  try {
    // Refresh access token if expired
    if (!oAuth2Client.credentials.expiry_date || Date.now() >= oAuth2Client.credentials.expiry_date) {
      console.log('🔄 Access token expired. Refreshing...');
      const { credentials } = await oAuth2Client.refreshAccessToken();
      oAuth2Client.setCredentials(credentials);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(credentials, null, 2));
      console.log('✅ Access token refreshed.');
    }

    const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 mins later

    const event = {
      summary,
      description,
      start: { dateTime: startTime.toISOString(), timeZone: 'Asia/Manila' },
      end: { dateTime: endTime.toISOString(), timeZone: 'Asia/Manila' },
      attendees: [{ email: attendeeEmail }],
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
    });

    return response.data.hangoutLink;
  } catch (err) {
    console.error('❌ Failed to create Meet event:', err.message);
    throw err;
  }
}

module.exports = { createMeetEvent };
