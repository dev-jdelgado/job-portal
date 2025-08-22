const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

const CREDENTIALS_PATH = path.join(__dirname, '../config/credentials.json');
const TOKEN_PATH = path.join(__dirname, '../config/token.json');

const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
const { client_secret, client_id, redirect_uris } = credentials.web;

const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// Load or refresh token automatically
function loadCredentials() {
  if (!fs.existsSync(TOKEN_PATH)) {
    console.error('❌ Missing token.json. Please run `authorize.js` once to generate it.');
    process.exit(1);
  }

  const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
  oAuth2Client.setCredentials(token);

  // Listen for automatic refresh events
  oAuth2Client.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
      // Save refresh token if Google rotates it
      const updated = { ...token, ...tokens };
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(updated, null, 2));
      console.log('🔄 Refresh token updated and saved.');
    } else if (tokens.access_token) {
      // Save new access token silently
      const updated = { ...token, ...tokens };
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(updated, null, 2));
    }
  });
}

loadCredentials();

const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

/**
 * Creates a Google Meet event
 * @param {string} summary - Event title
 * @param {string} description - Event details
 * @param {string} attendeeEmail - Attendee email
 * @param {Date} startTime - Start time (default now)
 */
async function createMeetEvent(summary, description, attendeeEmail, startTime = new Date()) {
  try {
    const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 minutes later

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
    if (err.code === 401 || err.code === 400) {
      console.error('❌ Google Auth Error: Token may be invalid or revoked. Run authorize.js again.');
    } else {
      console.error('❌ Failed to create Meet event:', err.message);
    }
    throw err;
  }
}

module.exports = { createMeetEvent };
