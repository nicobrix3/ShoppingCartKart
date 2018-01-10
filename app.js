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

require('dotenv').load();

var storage = require('./brix_dep/botkit-storage-mongo')({mongoUri:'mongodb://Marponsie:Password8732!@ds147882.mlab.com:47882/boiband'});
 
var fname;
var firstname;

var middleware = require('botkit-middleware-watson')({
  username: process.env.CONVERSATION_USERNAME,
  password: process.env.CONVERSATION_PASSWORD,
  workspace_id: process.env.WORKSPACE_ID,
  url: process.env.CONVERSATION_URL || 'https://gateway.watsonplatform.net/conversation/api',
  version_date: '2017-05-26'
});

module.exports = function(app) {
  if (process.env.USE_SLACK) {
    var Slack = require('./bot-slack');
    Slack.controller.middleware.receive.use(middleware.receive);
    Slack.bot.startRTM();
    console.log('Slack bot is live');
  }
  if (process.env.USE_FACEBOOK) {
    var Facebook = require('./bot-facebook');
    Facebook.controller.middleware.receive.use(middleware.receive);
    Facebook.controller.createWebhookEndpoints(app, Facebook.bot);
    console.log('Facebook bot is live');
  }
  if (process.env.USE_TWILIO) {
    var Twilio = require('./bot-twilio');
    Twilio.controller.middleware.receive.use(middleware.receive);
    Twilio.controller.createWebhookEndpoints(app, Twilio.bot);
    console.log('Twilio bot is live');
  }

  storage.users.get('11111', function(error, beans){
    fname = beans;
    firstname = beans.firstname;
    console.log(fname);
  });

  function checkBalance(context, callback){
    var contextDelta = {
      user_name: firstname
    };
    callback(null, context);
  }

  var checkBalanceAsync = Promise(checkBalance);

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
  Facebook.controller.on('message_received', processWatsonResponse);

  // Customize your Watson Middleware object's before and after callbacks.
  middleware.before = function(message, conversationPayload, callback) {
    console.log(JSON.stringify(conversationPayload));
    callback(null, conversationPayload);
    console.log("Inside Before Method. First Name: ");
    console.log(fname);
  }

  middleware.after = function(message, conversationResponse, callback) {
    console.log(JSON.stringify(conversationResponse));
    callback(null, conversationResponse);
  }
};
