/**/const AXIOS = require("axios");
/**/const FS = require("fs");
/**/const OPTIONS = require("./optionsFolder/options.js");
let tempDB = JSON.parse(FS.readFileSync('tempDB.json'));

let viewersInfoObj,
  url,
  path,
  resultOfCall,
  followCheck,
  //last time function was used "date"
  lastTime = {},
  //if writeToDB is "true" - database file will be updated
  writeToDB = true,
  callApiOnBotBoot = true,
steamArrayOfAppIDs = [];


let apiCall = (url, path) => {
  return AXIOS({
    method: 'get',
    url: url,
    headers: {
      'Client-ID': OPTIONS.twitchTMI.clientID
    }
  }).then(data => {
    let answer;
    if (!path) {
      answer = data.data;
    } else {
      answer = recurceIt(path, data);
    }

    let successResponse = {
      type: "success",
      data: answer
    };

    // console.log(successResponse.data);
    return successResponse;

  }).catch(error => {
    let errorResponse = {
      type: "error",
      data: error
    };

    // console.log(errorResponse);
    return errorResponse;
  });
};

const apiCallCase = {
  request: {
    streams: {
      url: "https://api.twitch.tv/kraken/streams/bashduude",
      path: {
        game: ["data","stream","game"],
        viewers: ["data","stream","viewers"],
        delay: ["data","stream","delay"],
        fps: ["data","stream","average_fps"],
        resolution: ["data","stream","video_height"],
        preview: {
          small: ["data","stream","preview","small"],
          medium: ["data","stream","preview","medium"],
          large: ["data","stream","preview","large"]
        },
        mature: ["data","stream","channel","mature"],
        partner: ["data","stream","channel","partner"],
        status: ["data","stream","channel","status"],
        broadcasterName: ["data","stream","channel","display_name"],
        accoutCreated: ["data","stream","channel","created_at"],
        liveSince: ["data","stream","channel","updated_at"],
        linkToStream: ["data","stream","channel","url"],
        views: ["data","stream","channel","views"],
        followers: ["data","stream","channel","followers"]
      }
    },
    follows: { //returns object if follows, else request will fail
      url: "https://api.twitch.tv/kraken/users/blank/follows/channels/bashduude"
    },
    users: { //shor user info describing if user is verified bot and stuff
      url: "https://api.twitch.tv/kraken/users/39141793/chat?api_version=5"
    },
    currentViewers: {
      url: "http://tmi.twitch.tv/group/user/bashduude/chatters"
    },
    currentGame: {
      url: "https://api.twitch.tv/kraken/channels/bashduude",
      path: {
        game: ["data", "game"]
      }
    },
    steamAPI: {
      urls: {
        listOfAppIDs: "http://api.steampowered.com/ISteamApps/GetAppList/v0001/",
        gameInfoByID: "https://store.steampowered.com/api/appdetails?appids=CHANGEID&LANGUAGE&CURRENCY"
      }
    }
  }
};

// returning path
function pathForApiFunction(path) {
  switch (path.toLowerCase()) {
    case "currentgame":
      return ["data", "game"];
      break;
    default:
    console.log("PATHFORAPIFUNCTION FOR =>> " + path + " <<= PATH HAS FAILED");
    console.log("NO SUCH PATH HAS BEEN FOUND");
    console.log("CALL WILL BE CANCELLED");
    // if (typeof currentGame === 'object') {return;} else {}
  }
}

//recursion of the path
//path - path for url
//data - object, response from url
let recurceIt = (path, data) => {
  let result = null;
  let p = path.shift();
  if (p && data) {
  	result = recurceIt(path, data[p]);
  } else {
  	result = data;
  }
  return result;
};

//replacing string with key values from given object
let replaceIt = (str, mapObj) => {

  let regEx = new RegExp(Object.keys(mapObj).join("|"),"gi");

  return str.replace(regEx, function(match) {
    return mapObj[match];
  });

};




//cb is callback to handletmi isFollower function
let handleCalls = async (what, data) => {
  //in this case data = object with user name

  switch (what) {
    case "follows":
      await followsFunction(data);
      break;
    case "viewersInfo":
      await viewersInfoFunction(data);
      break;
    case "currentGame":
      await currentGameFunction(data);
      break;
    case "prepareChannelForDB":
      createFoldersInDataBaseForCurrentUserFunction(data);
      break;
    case "streamInfo":
      return await streamInfoFunction(data);
      // break;
    default:
      console.log("[apiCall.js][handleCalls()]\
       Went into \"default\" in switch");
      console.log(`Because of this request: ${what}`);
      console.log(" ");
      
      
  }


};

async function listOfAppIDsFuncion() {

  url = apiCallCase.request.steamAPI.urls.listOfAppIDs;
  let listOfAppIDsResponse = await apiCall(url);
  steamArrayOfAppIDs = listOfAppIDsResponse.data.applist.apps.app;
  console.log("CALL FOR listOfAppID's IS DONE");
}

async function streamInfoFunction(data) {

  if (!(ifTimePassedFunction(60, "streamInfo", data))) {
    return;
  }

  console.log("[apiCall.js][streamInfoFunction()] RECALLING streamInfoFunction!") 

  let replacingStream = {
    bashduude: data.channel
  };
  url = replaceIt(apiCallCase.request.currentGame.url, replacingStream);

  let streamInfoResponse = await apiCall(url);

  // if (!tempDB.hasOwnProperty(data.channel)) {
  //   tempDB[data.channel] = {};
  //   if (!tempDB.hasOwnProperty(data.channel.streamInfo)) {
  //     tempDB[data.channel].streamInfo = {};
  //   }
  // }
  
  tempDB[data.channel].streamInfo = {
    mature: streamInfoResponse.data.mature,
    partner: streamInfoResponse.data.partner,
    game: streamInfoResponse.data.game,
    status: streamInfoResponse.data.status,
    broadcasterLanguage: streamInfoResponse.data.broadcaster_language,
    broadcasterName: streamInfoResponse.data.display_name,
    broadcasterID: streamInfoResponse.data._id,
    channelCreatedAt: streamInfoResponse.data.created_at,
    lastStreamBeen: streamInfoResponse.data.updated_at,
    views: streamInfoResponse.data.views,
    followers: streamInfoResponse.data.followers,
    delay: streamInfoResponse.data.delay,
    banner: streamInfoResponse.data.banner,
    background: streamInfoResponse.data.background,
    url: streamInfoResponse.data.url,
    logo: streamInfoResponse.data.logo,
    videoBanner: streamInfoResponse.data.video_banner,
    profileBanner: streamInfoResponse.data.profile_banner,
    
  };
  
  writeToDBFunction(); 

  let streamerData = {
    channel: streamInfoResponse.data.display_name,
    language: streamInfoResponse.data.broadcaster_language
  };

  if (streamerData.language == "ru") {
    streamerData.channelIsRussian = true;
  } else {
    streamerData.channelIsRussian = false;
  }

  return streamerData;
}

async function currentGameFunction(data) {

  await streamInfoFunction(data);
  
  let stringtosearchfor = tempDB[data.channel].streamInfo.game.toLowerCase();
  console.log(stringtosearchfor);
  if (stringtosearchfor === "irl" || stringtosearchfor === "programming") {
    console.log("wasn't looking since the game is \"" + stringtosearchfor + "\"");
    return;
  }

  let currentGame = steamArrayOfAppIDs.find(i => i.name.toLowerCase() === stringtosearchfor);

  let multipleOccasions = steamArrayOfAppIDs.filter(i => i.name.toLowerCase() === stringtosearchfor);

  console.log(multipleOccasions);
  if (multipleOccasions.length == 0) {
    console.log("массив пуст, бро");
    
  }
  

  if (currentGame == undefined) {
    console.log("no such game found");
  } else {
    let replacingUrl;

    let channelIsRussian = false;
    if (tempDB[data.channel].streamInfo.broadcasterLanguage === "ru") {
      channelIsRussian = true;
    }

    if (channelIsRussian) {
      replacingUrl = {
        CHANGEID: currentGame.appid,
        LANGUAGE: "l=russian",
        CURRENCY: "cc=russian"
      };
    } else {
      replacingUrl = {
        CHANGEID: currentGame.appid,
        LANGUAGE: "l=english",
        CURRENCY: "cc=us"
      };
    }
  
    url = replaceIt(apiCallCase.request.steamAPI.urls.gameInfoByID, replacingUrl);

    console.log("url too look for that game object");
    console.log(url);

    if (!(ifTimePassedFunction(60, "specificGameInfoResponse", data))) {
      return;
    }
  
    console.log(" ");
    console.log("RECALLING specificGameInfoResponse");
    console.log(" ");
      
    let specificGameInfoResponse = await apiCall(url);
    let gameObj = specificGameInfoResponse.data[currentGame.appid].data;

    if (!tempDB.hasOwnProperty(data.channel)) {
      tempDB[data.channel] = {};
      if (!tempDB.hasOwnProperty(data.channel.streamInfo)) {
        tempDB[data.channel].streamInfo = {};
      }
    }

    let gamePrice;
    if (!gameObj.price_overview) {
      if (channelIsRussian) {
        gamePrice = "Бесплатно";
      } else {
        gamePrice = "Free";
      }
    } else {
      gamePrice = gameObj.price_overview.final/100;
    }

    tempDB[data.channel].streamInfo.gameInfo = {
      game: tempDB[data.channel].streamInfo.game,
      gamePrice: gamePrice,
      gameDescription: gameObj.short_description,
      gameLink: `https://store.steampowered.com/app/${currentGame.appid}`
    };

    writeToDBFunction();
    
  }
}

async function followsFunction(data) {


  //if already in database(not new user)
  if (tempDB[data.channel].viewers.hasOwnProperty([data.username])) {
    if (tempDB[data.channel].viewers[data.username].follows) {
      return true;
    }
  }
  
  console.log(`followsFunction is triggered by new user join: ${data.username}`);

 ///////////////////////////generating proper url/////////////////////////
 //basically with this code no matter which stream bot has joined
 //it will automatically replace it with proper streamer and viewer
  let replacingNameAndStream = {
    blank: data.username,
    bashduude: data.channel
  };

  url = replaceIt(apiCallCase.request.follows.url, replacingNameAndStream);
 /////////////////////end of generating proper url/////////////////////////


  let followsFunctionResponse = await apiCall(url);
  let followsBool;
  let followDate;
  let followGame;
  if (followsFunctionResponse.type === "error") {
    followsBool = false;
  } else if (followsFunctionResponse.type === "success") {
    followDate = followsFunctionResponse.data.created_at;
    // followDate = followsFunctionResponse.data.created_at.split(/T|Z/g, 2);
    followsBool = true;
  }


  //checks wether user already in database or not
  //else creates needed properties
  if (!tempDB.hasOwnProperty(data.channel)) {
    tempDB[data.channel] = {};
    if (!tempDB.hasOwnProperty(data.channel.viewers)) {
      tempDB[data.channel].viewers = {};
    }
  }

  let followAgeInDays = 0;
  if (followsBool) {
    // days past since user followed the stream
    followAgeInDays = Math.floor((Date.now() 
    - Date.parse(followDate))/86400000);
    //which game i was playing when follow occur?
    followGame = tempDB[data.channel].streamInfo.game;    
  }

  tempDB[data.channel].viewers[data.username] = {
    name: data.username,
    follows: followsBool,
    lastSeen: new Date(),
    followDate: followDate,
    followAgeInDays: followAgeInDays,
    followGame: followGame
  };

  writeToDBFunction();

  return followsBool;

}

async function viewersInfoFunction(data) {

  if (!(ifTimePassedFunction(60, "viewersInfoFunction", data))) {
    return;
  }

  console.log(" ");
  console.log("MAKING NEW CALL FOR viewersInfoFunction");
  console.log(" ");

  let replacingStream = {
    bashduude: data.channel
  };

  url = replaceIt(apiCallCase.request.currentViewers.url, replacingStream);

  console.log("inside viewersInfoFunction");
  console.log(url);

  let viewersInfoResponse = await apiCall(url);

  tempDB[data.channel].viewersInfo = {
    viewersCount: viewersInfoResponse.data.chatter_count,
    vip: viewersInfoResponse.data.chatters.vips,
    moderators: viewersInfoResponse.data.chatters.moderators,
    staff: viewersInfoResponse.data.chatters.staff,
    admins: viewersInfoResponse.data.chatters.admins,
    globalMods: viewersInfoResponse.data.chatters.global_mods,
    viewers: viewersInfoResponse.data.chatters.viewers,
    notFollowing: 0,
    notFollowingArr: []
  };

  writeToDBFunction();

  let tempDBPath = tempDB[data.channel].viewersInfo;

  let chatters = tempDBPath.moderators.concat(
    tempDBPath.viewers, tempDBPath.vip, tempDBPath.staff,
    tempDBPath.admins, tempDBPath.globalMods);

  console.log(chatters);
  for (let i = 0, j = chatters.length; i < j; i++) {
    let info = {
      username: chatters[i],
      channel: data.channel
    };

    let followsFunctionResponse = await followsFunction(info);

    console.log("currently checking: " + info.username);
    console.log("does he follow the stream? " + followsFunctionResponse);
    

    //forbiddenNames is basically bots
    let forbiddenNames = ["logviewer", "hnlbot", "p0sitivitybot", "skinnyseahorse", "slocool", "apricotdrupefruit", "commanderroot", "lanfusion", "electricallongboard", "philderbeast", "stay_hydrated_bot", "whitethumb", "streamchat_tmnt", "bananennanen", "avocadobadado", "electricalskateboard"];

    //if user not follows the stream modify the object
    //doesn't count known bots and channel owners
    if (followsFunctionResponse === false) {
      console.log("попал в Иф: " + info.username);
      console.log("фолловит?: " + followsFunctionResponse);
      if (forbiddenNames.indexOf(info.username) == -1) {
        if (data.channel != info.username) {
          tempDB[data.channel].viewersInfo.notFollowing++;
          tempDB[data.channel].viewersInfo.notFollowingArr.push(info.username);
        }
      }
    }
    writeToDBFunction();
  }

}


//Calls API's when launching bot.
async function callApiOnBotBootFunction() {
  console.log("STARTING CALLING DIFFERENT API's");
  await listOfAppIDsFuncion();
  console.log("ALL CALLS ARE DONE");
}

  
function writeToDBFunction() {
  if (writeToDB){
    // tempDB = JSON.stringify(tempDB);// most optimized, no indent
    let updateDB = JSON.stringify(tempDB, null, 2);
    FS.writeFile('tempDB.json', updateDB, finished);
    function finished(data) {
      console.log("Database has been updated..");
    };
  }
}

function createFoldersInDataBaseForCurrentUserFunction(data) {
  console.log("Preparing user for DB");

  tempDB[data.channel] = tempDB[data.channel] || {};
  tempDB[data.channel].viewers = tempDB[data.channel].viewers || {};
  tempDB[data.channel].viewersInfo = tempDB[data.channel].viewersInfo || {};
  tempDB[data.channel].streamInfo = tempDB[data.channel].streamInfo || {};

  writeToDBFunction();
}

// returns false if time hasn't passed yet, and true otherwise
function ifTimePassedFunction(seconds = 60, what, data) {
  if (!lastTime.hasOwnProperty(data.channel)) {
    lastTime[data.channel] = {};
    lastTime[data.channel][what] = 0;
  }
  if (Math.floor((new Date() - lastTime[data.channel][what])/1000) < seconds ) {
    // get from variable
    return false;
  } else {
    lastTime[data.channel][what] = new Date();
    console.log(lastTime);
    
    // get from url
    return true;
  }
}

//test yet again


//exports
module.exports.recurceIt = recurceIt;
module.exports.apiCallCase = apiCallCase;
module.exports.apiCall = apiCall;
module.exports.handleCalls = handleCalls;
module.exports.tempDB = tempDB;
module.exports.callApiOnBotBootFunction = callApiOnBotBootFunction;
