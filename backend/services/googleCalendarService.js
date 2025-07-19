const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

const CREDENTIALS_PATH = path.join(__dirname, '../config/credentials.json'); // path to your credentials.json
const TOKEN_PATH = path.join(__dirname, '../config/token.json'); // token will be saved here after first authorization

const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
const { client_secret, client_id, redirect_uris } = credentials.web;

const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

if (fs.existsSync(TOKEN_PATH)) {
  const token = fs.readFileSync(TOKEN_PATH, 'utf8');
  oAuth2Client.setCredentials(JSON.parse(token));
} else {
  console.error('Missing token.json. Please authorize your app.');
  process.exit(1);
}

const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

// Add `startTime` argument
async function createMeetEvent(summary, description, attendeeEmail, startTime = new Date()) {
  const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 min meeting
  const event = {
    summary,
    description,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: 'Asia/Manila'
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: 'Asia/Manila'
    },
    attendees: [{ email: attendeeEmail }],
    conferenceData: {
      createRequest: {
        requestId: `meet-${Date.now()}`,
        conferenceSolutionKey: { type: "hangoutsMeet" }
      }
    }
  };

  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
    conferenceDataVersion: 1
  });

  return response.data.hangoutLink;
}


module.exports = { createMeetEvent };
