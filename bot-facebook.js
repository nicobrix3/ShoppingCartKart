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
var Promise = require('bluebird');
var storage = require('./brix_dep/botkit-storage-mongo')({mongoUri:'mongodb://Marponsie:Password8732!@ds147882.mlab.com:47882/boiband'});
var fname;

var controller = Botkit.facebookbot({
  access_token: process.env.FB_ACCESS_TOKEN,
  verify_token: process.env.FB_VERIFY_TOKEN
});

var bot = controller.spawn();

storage.users.get('11111', function(error, beans){
  fname = beans.firstname;
});

function checkBalance(context, callback){
  console.log("CHECKBALANCE!!!");
  var contextDelta = {
    user_name: fname
  };
  callback(null, context);
}

var checkBalanceAsync = Promise.promisify(checkBalance);

var processWatsonResponse = function (bot, message) {
  console.log("NING SULOD SA PROCESSWATSONRESPONSE!!!");
  if (message.watsonError) {
    console.log(message.watsonError);
    return bot.reply(message, "I'm sorry, but for technical reasons I can't respond to your message");
  }
  if (typeof message.watsonData.output !== 'undefined') {
    //send "Please wait" to users
    console.log(fname);
    console.log("Ari mo reply ang bot");
    bot.reply(message, message.watsonData.output.text.join('\n'));
    console.log("Ning reply na ang bot");
    if (message.watsonData.output.action === 'check_balance') {
      var newMessage = clone(message);
      newMessage.text = 'balance result';
      checkBalanceAsync(message.watsonData.context).then(function (contextDelta) {
        return watsonMiddleware.sendToWatsonAsync(bot, newMessage, contextDelta);
      }).catch(function (error) {
        newMessage.watsonError = error;
      }).then(function () {
        return processWatsonResponse(bot, newMessage);
      });
    }
  }
};

//controller.hears('greetings', 'message_received', processWatsonResponse);

/*controller.hears('(.*)', 'message_received', function(bot, message) {
  bot.reply(message, message.watsonData.output.text.join('\n'));
});*/

//controller.hears('(.*)', 'message_received', processWatsonResponse);
controller.on('message_received', processWatsonResponse);

module.exports.controller = controller;
module.exports.bot = bot;
