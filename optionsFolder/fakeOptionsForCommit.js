//twitch oath
const twitchTMI = {
    options: {
        debug: true
    },
    connection: {
        reconnect: true,
        secure: true
    },
    identity: {
        username: "yourTwitchUsername",
        password: "yourTwitchOath(https://twitchapps.com/tmi/)" 
    },
    clientID: "yourTwitchAppClientID",
    channels: ["list channel names for bot to enter (type=string, separated with comma) Ex: 'bashduude', 'sodapoppin'"],
    thing: "!",
    channelsLang: {
      ru: [
        "bashduude",
        "benny495"
      ],
      en: [
        "dirty_crispy",
        "nani"
      ]
    }
};

//firebase config
const firebaseConfig = {
  apiKey: "yourFirebaseStuff",
  authDomain: "yourFirebaseStuff",
  databaseURL: "yourFirebaseStuff",
  projectId: "yourFirebaseStuff",
  storageBucket: "yourFirebaseStuff",
  messagingSenderId: "yourFirebaseStuff"
};


//exports
module.exports.twitchTMI = twitchTMI;
module.exports.firebaseConfig = firebaseConfig;
