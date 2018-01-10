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
var Promise = require("bluebird");

var controller = Botkit.facebookbot({
  access_token: process.env.FB_ACCESS_TOKEN,
  verify_token: process.env.FB_VERIFY_TOKEN
});

var bot = controller.spawn();

function checkBalance(context, callback){
  var contextDelta = {
    user_name: firstname
  };
  callback(null, context);
}

var checkBalanceAsync = Promise.promisify(checkBalance);

var processWatsonResponse = function (bot, message) {
  if (message.watsonError) {
    return bot.reply(message, "I'm sorry, but for technical reasons I can't respond to your message");
  }
  if (typeof message.watsonData.output !== 'undefined') {
    //send "Please wait" to users
    bot.reply(message, message.watsonData.output.text.join('\n'));
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
controller.on('message_received', processWatsonResponse);

controller.hears('(.*)', 'message_received', function(bot, message) {
  bot.reply(message, message.watsonData.output.text.join('\n'));
});

module.exports.controller = controller;
module.exports.bot = bot;
