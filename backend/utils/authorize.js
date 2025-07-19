const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { google } = require('googleapis');

const CREDENTIALS_PATH = path.join(__dirname, '../config/credentials.json');
const TOKEN_PATH = path.join(__dirname, '../config/token.json');

const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
const { client_secret, client_id, redirect_uris } = credentials.web; // or .installed based on your file

const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Authorize this app by visiting this URL:\n', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('\nEnter the code from that page here: ', (code) => {
    rl.close();

    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);

      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
      console.log('\n✅ Token stored to:', TOKEN_PATH);
    });
  });
}

getAccessToken(oAuth2Client);
