/**
 * Copyright 2016 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Botkit = require('botkit');
var clone = require('clone');
/*var storage = require('botkit-storage-mongo')({mongoUri:'mongodb://Marponsie:Password8732!@ds147882.mlab.com:47882/boiband', tables: ['userdata']});
//var storage = require('./brix_dep/botkit-storage-mongo')({mongoUri:'mongodb://Marponsie:Password8732!@ds147882.mlab.com:47882/boiband', tables: ['userdata']});
var d = new Date();
d.setSeconds(5);
var maxElapsedUnits = d.getSeconds();*/

var controller = Botkit.facebookbot({
  access_token: process.env.FB_ACCESS_TOKEN,
  verify_token: process.env.FB_VERIFY_TOKEN,
});

var bot = controller.spawn();

var middleware = require('botkit-middleware-watson')({
  username: process.env.CONVERSATION_USERNAME,
  password: process.env.CONVERSATION_PASSWORD,
  workspace_id: process.env.WORKSPACE_ID,
  url: process.env.CONVERSATION_URL || 'https://gateway.watsonplatform.net/conversation/api',
  version_date: '2017-05-26'
});

var processWatsonResponse = function(bot, message){
  console.log("Just heard the following message: " + JSON.stringify(message));
  if(message.watsonError){
    console.log("Watson Error: " + JSON.stringify(message.watsonError));
    return bot.reply(message, "I'm sorry, but for technical reasons I can't respond to your message");
  }
  //bot.reply(message, message.watsonData.output.text.join('\n'));

  if(typeof message.watsonData.output !== 'undefined') {
    //send please wait to user
    bot.reply(message, message.watsonData.output.text.join('\n'));

    /*storage.channels.get(message.channel, function(err,data){
      console.log(JSON.stringify(message.channel));
      console.log("data: " + JSON.stringify(data));
      if(err){
        console.log("Warning: error retrieving channel: " + message.channel + " is: " + JSON.stringify(err));
      } else {
        if(!data || data === null){
          data = {id: message.channel};
        }

        console.log("Successfully retrieved conversation history...");

        if(data && data.date) {
          var lastActivityDate = new Date(data.date);
          var now = new Date();
          var secondsElapsed = (now.getTime() - lastActivityDate.getTime())/1000;
          console.log("Seconds Elapsed: " + secondsElapsed);
          console.log("Max Elapsed Units (Timelimit): " + maxElapsedUnits);
          if(secondsElapsed > maxElapsedUnits) {
            console.log("Should end the conversation.");
          } else{
            console.log("Continue conversation");
          }
        }
      }
    }); */

    if(message.watsonData.output.action === 'check_balance'){
      var newMessage = clone(message);
      newMessage.text = 'check the name';
      //send to Watson
      middleware.interpret(bot, newMessage, function(){
        //send results to user
        processWatsonResponse(bot, newMessage);
      });
    }
  }
};

/*controller.hears('(.*)', 'message_received', function(bot, message) {
  bot.reply(message, message.watsonData.output.text.join('\n'));
});*/

controller.on('message_received', processWatsonResponse);

module.exports.controller = controller;
module.exports.bot = bot;
module.exports.processWatsonResponse = processWatsonResponse;
