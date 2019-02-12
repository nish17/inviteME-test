const {
  dialogflow,
  SignIn,
  Suggestions,
  SimpleResponse
} = require("actions-on-google");
// const { randomize, Randomization } = require("randomize");
const functions = require("firebase-functions");
const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const app = dialogflow({
  clientId:
    "359682853932-e65k9aulu37anjl8usajrjr2fb8qm2up.apps.googleusercontent.com"
});
const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

const TOKEN_PATH = "token.json";
function authorize(credentials, callback, conv) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client, conv);
  });
}

function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question("Enter the code from that page here: ", code => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
        if (err) console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

app.intent("Default Welcome Intent", conv => {
  // conv.ask(`<speak>Welcome to inviteME! Please say start to begin!</speak>`);
  // conv.ask(new Suggestions(`Let's begin!`));
  conv.ask("Lets start");
  // fs.readFile("./credentials.json", (err, content) => {
  //   if (err) return console.log("Error loading client secret file:", err);
  //   authorize(
  //     JSON.parse(content),
  //     conv => {
  //       conv.ask(
  //         new SimpleResponse({
  //           speech: "Thanks for logging in!",
  //           text: "Thanks for logging in!"
  //         }),
  //         new Suggestions("Show evevnts")
  //       );
  //     },
  //     conv
  //   );
  // });

  conv.ask(new Suggestions(["Let's Begin", "List events"]));
});

app.intent("beginIntent", conv => {
  // conv.close(`<speak>Starting the app!</speak>`);
  conv.ask(new SignIn("To serve you better"));
});

app.intent("actions.intent.SIGN_IN", (conv, params, signin) => {
  // if (signin.status !== "OK") {
  //   conv.ask("You need to sign in before using the app.");
  // } else {
  //   // const payload = conv.user.profile.payload;
  //   conv.ask(`Great! Welcome. Thanks for signing in. `);
  // }
});

function listEvents(auth, conv) {
  let data1 = "";
  const calendar = google.calendar({ version: "v3", auth });
  calendar.events.list(
    {
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime"
    },
    (err, res) => {
      if (err) return console.log("The API returned an error: " + err);
      const events = res.data.items;
      if (events.length) {
        console.log("Upcoming 10 events:");
        events.map((event, i) => {
          const start = event.start.dateTime || event.start.date;
          data1 += `${start} - ${event.summary}`;
        });
      } else {
        data1 += "No upcoming events found.";
      }
    }
  );
  return data1;
}
app.intent("listSuggestions", conv => {
  // conv.close(`<speak>Starting the app!</speak>`);
  // let credentials = {};

  fs.readFile("./credentials.json", (err, content) => {
    if (err) return console.log("Error loading client secret file:", err);

    // const { client_secret, client_id, redirect_uris } = JSON.parse(
    //   content
    // ).installed;
    // const oAuth2Client = new google.auth.OAuth2(
    //   client_id,
    //   client_secret,
    //   redirect_uris[0]
    // );
    let speech = authorize(content, listEvents, conv);
    conv.ask(speech);
    // return
    // listEvents(oAuth2Client, conv);
  });
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
