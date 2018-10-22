/****************requiries********************/
/**/const TMI = require("tmi.js");
/**/const EXPRESS = require("express");
/**/const FIREBASE = require("firebase");
/**local files requiries**/
/**/const OPTIONS = require("./optionsFolder/options.js");
/**/const HANDLETMI = require("./handleTMI.js");
/*************************************************/

//tmi connect
const CLIENT = new TMI.client(OPTIONS.twitchTMI);
// Connect the client to the server..
CLIENT.connect();
//handling all TMIjs Stuff
HANDLETMI(CLIENT);

//firebase database connect
FIREBASE.initializeApp(OPTIONS.firebaseConfig);
const FIREBASEDB = FIREBASE.database();

//https://firebase.google.com/docs/database/web/read-and-write?authuser=0

/****************command symbol********************/
/**/const symbol = OPTIONS.twitchTMI.thing;
/**/const symbolRegEx = new RegExp("^"+symbol,"g");
/*************************************************/

