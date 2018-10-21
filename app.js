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










leCall = (response) =>{
  // let request = apiStuff.apiCall(apiStuff.apiCallCase.request.streams.url,apiStuff.apiCallCase.request.streams.path.viewers);
  apiStuff.apiCall(apiStuff.apiCallCase.request.follows.url);

  // client.say("bashduude", `${request}`);
}

apiCallResponse = (response) =>  {
  console.log("app.js response ");
  console.log(response);
}

// leCall();

client.on("join", function (channel, username, self) {

switch (channel) {
  case ("#bashduude"):
    switch (username) {
      case ("bashduude"):
          // let message = `Чат, ваши гадости подлежат рассмотрению FeelsWeirdMan `;
          // let url = apiStuff.apiCallCase.request.streams.url;
          // let path = apiStuff.apiCallCase.request.streams.path.viewers;
          // makeCall(url, path, message, channel, username, self);
          // chatJoins.handleChatJoins(channel, username, self);
        break;
      default:
    }
    break;
  default:
}
});

let greeting = (channel, username,message,info) => {
  console.log("inside greeting");
  console.log(info);
  message = message + " " + info;
  client.say(channel, message);
};


let makeCall = (url,path,message,channel,username) => {
  apiStuff.apiCall(url,path);
  // console.log("inside makeCall returning info");
  greeting(channel, username, message, info);
};

//баловство


client.on("chat", function (channel, userstate, message, self) {
  if (/^!14/g.test(message) || /^test/g.test(message)) {
    let viewersObj = apiStuff.tempDB;
    let answer;
    // client.say(channel, answer);
    let vali = message.split(" ");
    console.log(vali);
    if (vali.length > 1) {


      functionName(vali[1].toLowerCase());
      function functionName(name) {
        console.log(name);
        console.log("inside chat say");
        if (viewersObj.viewers[name].follows === true) {
          answer = `${vali[1]} is following the stream! PogChamp `;
          setTimeout(function(){ client.say(channel, answer); }, 1500);
        } else if (viewersObj.viewers[name] === undefined) {
          answer = `I havn't check ${vali[1]} yet sorry.`;
          setTimeout(function(){ client.say(channel, answer); }, 1500);
        } else {
          answer = `${vali[1]} does not follows the stream! DansGame `;
          setTimeout(function(){ client.say(channel, answer); }, 1500);
        }
      }
    }
  }

});

client.on("chat", function (channel, userstate, message, self) {
  if (message === "!spacebar") {
    let answer ="  Kappa ";
    setTimeout(function(){ client.say(channel, answer); }, 1500);
  }
});

//конец баловства

//кто-то отправил cheer
client.on("cheer", function (channel, userstate, message) {
  let cheerActionMessage = `${userstate.username} отправил битсов, спасибо! Champ HYPERCLAP `;
  client.action(channel, cheerActionMessage);
});
//конец cheer

//resub
client.on("resub", function (channel, username, months, message, userstate, methods) {
  let resubActionMessage = `${username} только что продлил подписку через ${methods} на канал! Его комбо составляет ${months} месяцев! Похлопаем ему Pog CLAP `;
  let resubMessage = username + message;
  client.action(channel, resubActionMessage);
  client.action(channel, resubActionMessage);
});

//sub
client.on("subscription", function (channel, username, method, message, userstate) {
  let subActionMessage = `${username} только что подписался на канал через ${methods} ! Похлопаем ему Pog CLAP `;
  let subMessage = username + message;
  client.action(channel, subActionMessage);
  client.action(channel, subMessage);
});









//exports
// module.exports.apiCallResponse = apiCallResponse;
