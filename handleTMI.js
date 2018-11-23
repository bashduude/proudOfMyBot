/**/const APISTUFF = require("./apiCall.js");
/**/const commonVariables = require("./commonVariables.js");
/**/const LANGFILE = require("./lang.json");
// /**/const FS = require("fs");

 
//describes language of a user
let lang;
let readyForQuiz = [];
let channelIsRussian = false;
let channelAndLanguage = [];
// let joinedChannels = JSON.parse(FS.readFileSync('joinedChannels.json'));

//if true activates timers messages on channel
let loadTimers = true;

const handleTMI = (client) => {

  client.on("connected", function (address, port) {
    console.log("Bot is connected to server and ready to work...");
    APISTUFF.callApiOnBotBootFunction();
    let joinedStreamsArray = client.opts.channels;
    joinedStreamsArray.forEach(channelName => {
      let data = {
        channel: channelName.slice(1)
      };
      console.log(data);
      
      APISTUFF.handleCalls("prepareChannelForDB", data);
      APISTUFF.handleCalls("streamInfo", data)
      .then(data => {
        if (data.channel == "bashduude") {
          data.timeoutValues = {
            quickMessages: commonVariables.timeoutValues.valuesForBashChannel.quickMessages,
            commonMessage: commonVariables.timeoutValues.valuesForBashChannel.commonMessage,
            waitingApiCallMessage: commonVariables.timeoutValues.valuesForBashChannel.waitingApiCallMessage
          };
        } else {
          data.timeoutValues = {
            quickMessages: commonVariables.timeoutValues.valuesForOtherChannels.quickMessages,
            commonMessage: commonVariables.timeoutValues.valuesForOtherChannels.commonMessage,
            waitingApiCallMessage: commonVariables.timeoutValues.valuesForOtherChannels.waitingApiCallMessage
          };
        }
        channelAndLanguage.push(data);
        // joinedChannels = channelAndLanguage;
        // let updateJoinedChannels = JSON.stringify(joinedChannels, null, 2);
        // FS.writeFile('joinedChannels.json', updateJoinedChannels, finished);
        // function finished(data) {
        //   console.log("Database has been updated..");
        // };   
      })
      .catch(error => {console.error(error)});
    });
  });


  client.on("join", function (channel, username, self) {
    handleChatJoins(channel, username, self);
  });


  client.on("message", function (channel, userstate, message, self) {

    let data = {};
    channelAndLanguage.forEach(stream => {
      if (stream.channel.toLowerCase() == channel.slice(1).toLowerCase()) {
        data = stream;

        //МЕРЗКО БЛЯТЬ, КАК СДЕЛАТЬ КРАСИВЕЕ ТУЛОВЕРКЕЙС
        let channelNameToLowerCase = data.channel.toLowerCase();
        data.channel = channelNameToLowerCase;
    
        data.userstate = userstate;
        data.message = message;
        if (data.channelIsRussian) {   
          lang = LANGFILE.ru;
        } else {
          lang = LANGFILE.en;
        }     
      }
    });
 

    // console.log(channelAndLanguage);
    // console.log(data);

    

    //setting timeout values for channels and lang files
    // if (data.channel == "bashduude") {
    //   data.timeoutValues = {
    //     quickMessages: commonVariables.timeoutValues.valuesForBashChannel.quickMessages,
    //     commonMessage: commonVariables.timeoutValues.valuesForBashChannel.commonMessage,
    //     waitingApiCallMessage: commonVariables.timeoutValues.valuesForBashChannel.waitingApiCallMessage
    //   };
    //   lang = LANGFILE.ru;
    //   data.isChannelRussian = true;
    //   console.log("channel is russian -bash");
      
    // } else {
    //   data.timeoutValues = {
    //     quickMessages: commonVariables.timeoutValues.valuesForOtherChannels.quickMessages,
    //     commonMessage: commonVariables.timeoutValues.valuesForOtherChannels.commonMessage,
    //     waitingApiCallMessage: commonVariables.timeoutValues.valuesForOtherChannels.waitingApiCallMessage
    //   };
    //   if (client.opts.channelsLang.ru.indexOf(data.channel) == -1) {
    //     lang = LANGFILE.en;
    //     data.isChannelRussian = false;

    //     console.log(data.channel);
        
    //     console.log("channel is NOT russian");
    //   } else {
    //     lang = LANGFILE.ru;
    //     data.isChannelRussian = true;
        
    //     console.log("channel is russian");
    //   }
    // }

    // console.time("testingTime");
    switch (userstate["message-type"]) {
      case "action":
        // action message "/me bla bla bla"
        break;
      case "chat":
        handleChatCommands(data);
        // console.timeEnd("testingTime");
        break;
      case "whisper":
        // whisper message "/w username message"
        if (readyForQuiz.indexOf(data.userstate.username)) {
          passTheQuizFunction(data);
        } else {
          handleWhisperMessages(data);
        }
        break;
      default:
        break;
    }
  });

  

  function handleChatJoins(channel, username, self) {

    let data = {
      username: username,
      channel: channel.slice(1)
    };

    (function isFollower() {
      APISTUFF.handleCalls("follows", data);
    }());
  };


  function handleChatCommands(data) {
 
    if (/^!/g.test(data.message)) {

      let messageType = data.message.split(" ").shift().slice(1).toLowerCase();
      console.log("messageType");
      console.log(messageType);


      switch (messageType) {
        case "viewersinfo":
          viewersInfoFunction(data);
          break;
        case "who":
          whoFunction(data);
          break;
        case "game":
          currentGameFunction(data);
          break;
        case "shrug":
          shrugFunction(data);
          break;
        case "whysolong":
          whysolongFunction(data);
          break;
        default:
      }
    }
    

    let messageForWhisperQuiz = `@bashduude i like you`;
    let regexForWhisperQuiz = RegExp(messageForWhisperQuiz, "gi");

    if ("bashduude" !== data.userstate.username) {
      if (regexForWhisperQuiz.test(data.message)) {
        console.log(`Matched message ${data.message} for QUIZ by ${data.userstate.username}`);
        
        readyForQuiz.push(data.userstate.username);
        console.log(readyForQuiz);
        

        let whisperData;
        if (lang == LANGFILE.ru) {
          whisperData = {
            toWhom: data.userstate.username,
            whisperMessage: `Привет, ${data.userstate.username}, я заметил ты ввел \"секретное сообщение\" в чате :) Желаешь пройти опрос? (Да / Нет)`
          };
        } else {
          whisperData = {
            toWhom: data.userstate.username,
            whisperMessage: `Hi, ${data.userstate.username}, I've noticed You have typed \"secret message\" in the chat :) Do You want to pass the quiz? (Yes / No)`
          };
        }

        sendWhisperFunction(whisperData);


        // passTheQuizFunction(data);
      }
    }



  };

  function passTheQuizFunction(data) {
    console.log(data);
    

    let whisperData = {
      toWhom: data.userstate.username,
      whisperMessage: ""
    };

    switch (data.message.toLowerCase()) {
      case "да":
      case "yes":

        break;
      case "нет":
      case "no":

        break;
      default:
        break;
    }


    
    sendWhisperFunction(whisperData);

  }


  function handleWhisperMessages(data) {
    if ("bashduude" !== data.userstate.username) {
      switch (data.message) {
        case 13:
          console.log("ОН ХОЧЕТ ПРОЙТИ ОПРОС");  
          break;
        case 12:
          console.log("НЕ БУДУ ПРОХОДИТЬ ОПРОС");
          break;      
        default:
          break;
      }
    }
  }

  function sendWhisperFunction(whisperData) {

    setTimeout(function(){
      client.whisper(whisperData.toWhom, whisperData.whisperMessage);
    }, 2500);

    // whisperDataExample = {
    //   toWhom: username to whom send the whisper,
    //   whisperMessage: whisper message itself
    //   /w toWhom whisperMessage
    // }
  }

  function whysolongFunction(data) {
    let timeoutValue = data.timeoutValues.commonMessage;
    setTimeout(function(){ client.action(data.channel, lang.handleChatCommands.whysolongFunction); }, timeoutValue);
  };

  function shrugTest() {
    let answer = "AHTUSHRUG >:]";
    let timeoutValue = 1000;
    setTimeout(function(){ client.say("bashduude", "Test Message From Website"); }, 1000);  
  };

  function shrugFunction(data) {
    let answer = "¯\\_(ツ)_/¯";
    let timeoutValue = data.timeoutValues.commonMessage;
    setTimeout(function(){ client.say(data.channel, answer); }, timeoutValue);  
  };

  async function currentGameFunction(data) {
    let timeoutValueCommon = data.timeoutValues.commonMessage;
    let timeoutValueAPI = data.timeoutValues.waitingApiCallMessage;
    let timeoutValueQuick = data.timeoutValues.quickMessages;
    setTimeout(function(){
      client.action(data.channel, lang.thinkingResponse);
    }, timeoutValueQuick);
    await APISTUFF.handleCalls("currentGame", data);

    let selectedChannel = APISTUFF.tempDB[data.channel].streamInfo;
    let currentGame = APISTUFF.tempDB[data.channel].streamInfo.game;
    let currentGamePrice;
    let currentGameDesc;
    let currentGameLink;
    //basically checks if game price is not undefined
    if (selectedChannel.hasOwnProperty("gameInfo")) {
      console.log("inside if statement in handleTMI gameinfo");
      
      currentGamePrice = APISTUFF.tempDB[data.channel].streamInfo.gameInfo.gamePrice;
      currentGameDesc = APISTUFF.tempDB[data.channel].streamInfo.gameInfo.gameDescription;
      currentGameLink = APISTUFF.tempDB[data.channel].streamInfo.gameInfo.gameLink;
    }

    if (currentGamePrice || currentGamePrice === 0) {
      setTimeout(function(){
        client.action(data.channel, lang.handleChatCommands.currentGameFunction[1] + currentGame);
        setTimeout(function(){
          if (typeof currentGamePrice === "string") {
            client.action(data.channel, lang.handleChatCommands.currentGameFunction[2] + currentGamePrice);
          } else {
            client.action(data.channel, lang.handleChatCommands.currentGameFunction[2] + currentGamePrice + lang.handleChatCommands.currentGameFunction[3]);
          }
          setTimeout(function(){
            client.action(data.channel, lang.handleChatCommands.currentGameFunction[4] + currentGameDesc);
            setTimeout(function(){
              client.action(data.channel, lang.handleChatCommands.currentGameFunction[5] + currentGameLink);
            }, timeoutValueQuick);
          }, timeoutValueQuick);
        }, timeoutValueQuick);
      }, timeoutValueQuick);
    } else {
      setTimeout(function(){
        client.action(data.channel, lang.handleChatCommands.currentGameFunction[1] + currentGame);
      }, timeoutValueQuick);
    }
  };

  function whoFunction(data) {
    let timeoutValueCommon = data.timeoutValues.commonMessage;
    let timeoutValueQuick = data.timeoutValues.quickMessages;
    setTimeout(function(){
      let unfollowers = APISTUFF.tempDB[data.channel].viewersInfo.notFollowingArr;
      let message = " imGlitch " + unfollowers;
      if (unfollowers.length > 0) {
        setTimeout(function(){ client.action(data.channel, message); }, timeoutValueQuick);
      } else {
        setTimeout(function(){ client.action(data.channel, lang.handleChatCommands.whoFunction); }, timeoutValueQuick);
      }

    }, timeoutValueCommon);
  };

  async function viewersInfoFunction(data) {
    let timeoutValueCommon = data.timeoutValues.commonMessage;
    let timeoutValueQuick = data.timeoutValues.quickMessages;
    let timeoutValueAPI = data.timeoutValues.waitingApiCallMessage;

    setTimeout(function(){
      client.action(data.channel, lang.thinkingResponse);
    }, timeoutValueCommon);

    await APISTUFF.handleCalls("viewersInfo", data);

    let chatters = APISTUFF.tempDB[data.channel].viewersInfo;
    setTimeout(function(){
      client.action(data.channel, lang.handleChatCommands.viewersInfoFunction[1]);
      setTimeout(function(){
        client.action(data.channel, lang.handleChatCommands.viewersInfoFunction[2] + chatters.viewersCount);
        if (chatters.notFollowing != 0) {
          setTimeout(function(){
            client.action(data.channel," imGlitch " + chatters.notFollowing + lang.handleChatCommands.viewersInfoFunction[3]);
            setTimeout(function(){
              client.action(data.channel,lang.handleChatCommands.viewersInfoFunction[4]);
            }, timeoutValueQuick);
          }, timeoutValueQuick);
        } else {
          setTimeout(function(){
            client.action(data.channel,lang.handleChatCommands.viewersInfoFunction[5]);
          }, timeoutValueQuick);
        }
      }, timeoutValueQuick);
    }, timeoutValueQuick);
  };


  (function loadTimersFunction() {
    let fiveMinutes = 300000;
    if (loadTimers) {
      console.log("loadTimersFunction is active in handleTMI.js");
      setTimeout(function(){
        console.log("logs this every 5 minutes");
      }, fiveMinutes);
    } else {
      console.log("loadTimersFunction is disabled");
    }
  }());


  // setTimeout(function(){
  //   client.whisper("bashdude", "My message");
  // }, 3000);
  

  return {
    shrugTest: shrugTest,
    shrugFunction: shrugFunction
  };








  


};
//end of handleTMI


module.exports = handleTMI;


