/****************requiries********************/
/**/const tmi = require("tmi.js");
/**/const express = require("express");
/**/const firebase = require("firebase");
/**local files requiries**/
/**/const options = require("./optionsFolder/options.js");
/**/const apiStuff = require("./apiCall.js");
/**/const handleTMI = require("./handleTMI.js");
/*************************************************/

//tmi connect
const client = new tmi.client(options.twitchTMI);
// Connect the client to the server..
client.connect();
//handling all TMIjs Stuff
handleTMI(client);

//firebase database connect
firebase.initializeApp(options.firebaseConfig);
const firebaseDB = firebase.database();

//https://firebase.google.com/docs/database/web/read-and-write?authuser=0

/****************command symbol********************/
/**/const symbol = options.twitchTMI.thing;
/**/const symbolRegEx = new RegExp("^"+symbol,"g");
/*************************************************/

