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
var clone = require('clone');
//var storage = require('./brix_dep/botkit-storage-mongo')({mongoUri:'mongodb://Marponsie:Password8732!@ds147882.mlab.com:47882/boiband'});
var storage = require('botkit-storage-mongo')({mongoUri:'mongodb://Marponsie:Password8732!@ds147882.mlab.com:47882/boiband', tables: ['userdata']});
var fname;

function checkBalance(conversationResponse, callback) {
  //middleware.after function must pass a complete Watson respose to callback
  //conversationResponse.context.user_name = 'Henrietta';
  conversationResponse.context.user_name = fname;
  callback(null, conversationResponse);
}

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

  /*storage.users.get('11111', function(error, beans){
    fname = beans.firstname;
  });*/

  // Customize your Watson Middleware object's before and after callbacks.
  middleware.before = function(message, conversationPayload, callback) {
    console.log("First Name: " + JSON.stringify(fname));
    console.log("Inside Before Method: " + JSON.stringify(conversationPayload));
    
    /*storage.channels.get(message.channel, function(err,data){
      console.log(JSON.stringify(message.channel));
      if(err){
        console.log("Warning: error retrieving channel: " + message.channel + " is: " + JSON.stringify(err));
      } else {
        if(!data || data === null){
          data = {id: message.channel};
        }

        console.log("Successfully retrieved conversation history...");

        //if(data && data.date) {
          const lastActivityDate = new Date(data.date);
          const now = new Date();
          const millisecondsElapsed = now.getMilliseconds() - lastActivityDate.getMilliseconds();
          console.log("Milliseconds Elapsed: " + millisecondsElapsed);
          console.log("Max Elapsed Units: " + maxElapsedUnits);
          if(millisecondsElapsed > maxElapsedUnits) {
            console.log("Should end the conversation.");
          } else{
            console.log("Continue conversation");
          }
        //}
      }
    });*/

    callback(null, conversationPayload);
  };

  middleware.after = function(message, conversationResponse, callback) {
    if(typeof conversationResponse !== 'undefined' && typeof conversationResponse.output !== 'undefined'){
      if(conversationResponse.output.action === 'check_balance'){
        return checkBalance(conversationResponse, callback);
      }
    }
    console.log("Inside After Method: " + JSON.stringify(conversationResponse));

    var lastActivityTime = new Date();
    console.log("Date: " + JSON.stringify(lastActivityTime));

    storage.channels.save({id: message.channel, date: lastActivityTime}, function(err) {
      if(err){
        console.log("Warning: error saving channel details: " + JSON.stringify(err));
      }
      else{
        console.log("Success saving channel detail.");
      }
    });

    callback(null, conversationResponse);
  };
};//comment