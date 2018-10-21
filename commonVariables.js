//timing variables
//set timeout atc
//set timeout for sending messages for myownchannel
//for some reason on your own channel you can send messages much quicker,
//it may have something to do with moderator status or smth...
//written in ms(milliseconds)
let timeoutValues = {
  valuesForBashChannel: {
    quickMessages: 500,
    commonMessage: 1200,
    waitingApiCallMessage: 5500
  },
  valuesForOtherChannels: {
    quickMessages: 1200,
    commonMessage: 1500,
    waitingApiCallMessage: 5500
  }
};


module.exports.timeoutValues = timeoutValues;
