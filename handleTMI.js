/**/const APISTUFF = require("./apiCall.js");
/**/const commonVariables = require("./commonVariables.js");
/**/const LANGFILE = require("./lang.json");

 
//describes language of a user
let lang;

//if true activates timers messages on channel
let loadTimers = true;

const handleTMI = (client) => {

  client.on("join", function (channel, username, self) {
    handleChatJoins(channel, username, self);
  });

  client.on("chat", function (channel, userstate, message, self) {
    handleChatCommands(channel, userstate, message, self);
  });

  

  function handleChatJoins(channel, username, self) {

    let data = {
      username: username,
      channel: channel.slice(1)
    };

    let joinedChannels = client.opts.channels.map(streamer => streamer.slice(1));

    if (username === "bashduude" && joinedChannels.indexOf(data.channel)) {
      console.log("should update db");
      APISTUFF.handleCalls("prepareNewChannelForDB", data);
    }

    (function isFollower() {
      APISTUFF.handleCalls("follows", data);
    }());
  };



  function handleChatCommands(channel, userstate, message, self) {

    let data = {
      channel: channel.slice(1),
      message: message,
      userstate: userstate
    };
    //setting timeout values for channels and lang files
    if (data.channel == "bashduude") {
      data.timeoutValues = {
        quickMessages: commonVariables.timeoutValues.valuesForBashChannel.quickMessages,
        commonMessage: commonVariables.timeoutValues.valuesForBashChannel.commonMessage,
        waitingApiCallMessage: commonVariables.timeoutValues.valuesForBashChannel.waitingApiCallMessage
      };
      lang = LANGFILE.ru;
    } else {
      data.timeoutValues = {
        quickMessages: commonVariables.timeoutValues.valuesForOtherChannels.quickMessages,
        commonMessage: commonVariables.timeoutValues.valuesForOtherChannels.commonMessage,
        waitingApiCallMessage: commonVariables.timeoutValues.valuesForOtherChannels.waitingApiCallMessage
      };
      if (client.opts.channelsLang.ru.indexOf(data.channel) == -1) {
        lang = LANGFILE.en;
      } else {
        lang = LANGFILE.ru;
      }
    }

    if (/^!/g.test(message)) {

      let messageType = message.split(" ").shift().slice(1).toLowerCase();
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
    //end of if (/^!/g.test(message))


  };

  function whysolongFunction(data) {
    let timeoutValue = data.timeoutValues.commonMessage;
    setTimeout(function(){ client.action(data.channel, lang.handleChatCommands.whysolongFunction); }, timeoutValue);
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
      console.log("loadTimersFunction is active");
      setTimeout(function(){
        console.log("logs this every 5 minutes");
      }, fiveMinutes);
    } else {
      console.log("loadTimersFunction is disabled");
    }
  }());

















  


};
//end of handleTMI

module.exports = handleTMI;


