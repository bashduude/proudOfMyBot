/****************requiries********************/
/**/const TMI = require("tmi.js");
/**/const EXPRESS = require("express");
/**/const FIREBASE = require("firebase");
/**/const BODYPARSER = require("body-parser");
/**/const FS = require("fs");
/**local files requiries**/
/**/const OPTIONS = require("./optionsFolder/options.js");
/**/const HANDLETMI = require("./handleTMI.js");
/*************************************************/


/*******************TMI SETUP******************/
//tmi connect
const CLIENT = new TMI.client(OPTIONS.twitchTMI);
// Connect the client to the server..
CLIENT.connect();
//handling all TMI.js Stuff
let tmiForWeb = HANDLETMI(CLIENT);
/*************************************************/

/*********firebase database connect************/
FIREBASE.initializeApp(OPTIONS.firebaseConfig);
const FIREBASEDB = FIREBASE.database();
//https://firebase.google.com/docs/database/web/read-and-write?authuser=0
/*************************************************/

/****************command symbol********************/
/**/const symbol = OPTIONS.twitchTMI.thing;
/**/const symbolRegEx = new RegExp("^"+symbol,"g");
/*************************************************/

/**************BODY PARSER SETUP***************/
const JSONPARSER = BODYPARSER.json()
const URLENCODEDPARSER = BODYPARSER.urlencoded({ extended: false })
/*************************************************/


/**************EXPRESS SERVER SETUP***************/
const APP = EXPRESS();
const PORT = process.env.PORT || 3000;

APP.use(EXPRESS.static('./public'));

APP.get('/supbitch', (req, res) => {
	res.send("SUP BITCH");
});

APP.post('/webhooks/twitch', (req, res) => {

});

APP.post('/webhooks', JSONPARSER, (req, res) => {
	console.log("Поступил пост в /webhooks");
	
	console.log(req.body);
	

	return res.json({
		success: true,
		message: "RECIEVED DATA ON BACKEND"
	});
});

APP.post('/shrug', JSONPARSER, (req, res) => {
	console.log("Поступил пост в /shrug");
	
	console.log(req.body);
	// setTimeout(function(){ CLIENT.say("bashduude", "Test Message From Website"); }, 50);
	// tmiForWeb.shrugTest();



	// switch (command) {
	// 	case "shrug":
			
	// 		break;
	
	// 	default:
	// 		break;
	// }

	let messageData = {
		channel: "bashduude",
		timeoutValues: {
			commonMessage: 1000
		}
	};

	tmiForWeb.shrugFunction(messageData);

	return res.json({
		success: true,
		message: "Shrug Was Posted in Chat"
	});
});



APP.listen(PORT, () => console.log(`NOW LISTENING ON PORT ${PORT}..`));
/*************************************************/