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
var storage = require('botkit-storage-mongo')({mongoUri:'mongodb://Marponsie:Password8732!@ds147882.mlab.com:47882/boiband', tables: ['userdata']});
//var storage = require('./brix_dep/botkit-storage-mongo')({mongoUri:'mongodb://Marponsie:Password8732!@ds147882.mlab.com:47882/boiband', tables: ['userdata']});
var d = new Date();
d.setSeconds(5);
var maxElapsedUnits = d.getSeconds();
var endedCondition = false;

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

function endConversation(message){
  console.log("Trying to end conversation");
  endedCondition = true;
  console.log("End Condition: " + endedCondition);
  var endMessage = clone(message);
  endMessage.text = 'time out';
  middleware.interpret(bot, endMessage, function(){
    //processWatsonResponse(bot, endMessage);
    bot.reply(endMessage, endMessage.watsonData.output.text.join('\n'));
  });
  console.log("Conversation ended");
}

function displayShoe(recipientId){
  console.log("Trying to display shoe");
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Link to Facebook",
          buttons:[{
            type: "web_url",
            url: "https://developers.facebook.com/docs/messenger-platform/reference/buttons/url#example_body"
          }]
        }
      }
    }
  };
  bot.reply(messageData);
}

var processWatsonResponse = function(bot, message){
  console.log("Just heard the following message: " + JSON.stringify(message));
  if(message.watsonError){
    console.log("Watson Error: " + JSON.stringify(message.watsonError));
    return bot.reply(message, "I'm sorry, but for technical reasons I can't respond to your message");
  }
  if(endedCondition == false) {
    if(typeof message.watsonData.output !== 'undefined') {
      //send please wait to user
      //console.log("Message: " + JSON.stringify(message));
      bot.reply(message, message.watsonData.output.text.join('\n'));
    }
  }
      if(message.watsonData.output.action === 'check_balance'){
        var newMessage = clone(message);
        newMessage.text = 'check the name';
        //send to Watson
        middleware.interpret(bot, newMessage, function(){
          //send results to user
          bot.reply(newMessage, newMessage.watsonData.output.text.join('\n'));
        });
      }
  endedCondition = false;
};

/*controller.hears('(.*)', 'message_received', function(bot, message) {
  bot.reply(message, message.watsonData.output.text.join('\n'));
});*/

controller.on('message_received', processWatsonResponse);

module.exports.controller = controller;
module.exports.bot = bot;
module.exports.endConversation = endConversation;
module.exports.displayShoe = displayShoe;