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

var express = require('express'),
https = require('https'),
path = require('path');

var app = express();
require('dotenv').load();
app.use('/images', express.static(path.join(__dirname, 'images')));
var clone = require('clone');
var storage = require('botkit-storage-mongo')({mongoUri:'mongodb://Marponsie:Password8732!@ds147882.mlab.com:47882/boiband', tables: ['userdata']});
var maxElapsedUnits = 900; //15 minutes
//var maxElapsedUnits = 5; // test timeout
console.log("Declared maxElapsedUnits: " + maxElapsedUnits + " seconds");
var userName;
var userLastName;
var userGender;
var fb_id;
var shoeBrand;
var shoeType;
var shoeColor;
var replyMessage;

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

  function getFBusername(path, callback) {
    return https.get({
        encoding: "utf8",
        host: 'graph.facebook.com',
        path: path
    }, function(response) {
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            // Data reception is done, do whatever with it!
            var parsed = JSON.parse(body);
            console.log("Parsed: " + JSON.stringify(parsed));
            var firstname = parsed.first_name;
            var lastname = parsed.last_name;
            var user_gender = parsed.gender;
            callback(firstname, lastname, user_gender);
        });
    });
  }

  function checkBalance(conversationResponse, callback) {
    //middleware.after function must pass a complete Watson respose to callback
    conversationResponse.context.user_name = userName; // Set context variables in watson conversation
    conversationResponse.context.fbid = fb_id;
    conversationResponse.context.user_lastname = userLastName;
    conversationResponse.context.gender = userGender;
    callback(null, conversationResponse);
  }

  // Customize your Watson Middleware object's before and after callbacks.
  middleware.before = function(message, conversationPayload, callback) {
    console.log("Inside Before Method: " + JSON.stringify(conversationPayload));
    replyMessage = clone(message);
    console.log("replyMessage: " + JSON.stringify(replyMessage));
    var path = "/v2.10/"+message.user+"/?access_token="+process.env.FB_ACCESS_TOKEN;
    console.log("PATH: " + path);
    getFBusername(path, function(firstname, lastname, user_gender){
      console.log("getFBusername");
      console.log("FB firstname "+ firstname +"\n");
      userName = firstname;
      userLastName = lastname;
      userGender = user_gender;
      console.log("userName: " + userName);
      console.log("userLastName: " + userLastName);
      console.log("userGender: " + userGender);
    });

    storage.channels.get(message.channel, function(err,data){
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
          console.log("Max Elapsed Units: " + maxElapsedUnits);
          console.log("Seconds Elapsed: " + secondsElapsed);
          if(secondsElapsed > maxElapsedUnits) {
            //end conversation
            console.log("Should end the conversation.");
            Facebook.endConversation(message);
          } else {
            console.log("Continue conversation");
          }
        }
      }
    });
    var lastActivityTime = new Date();
    console.log("Date: " + JSON.stringify(lastActivityTime));
    storage.channels.save({id: message.channel, date: lastActivityTime}, function(err) {
      if(err){
        console.log("Warning: error saving channel details: " + JSON.stringify(err));
      }
      else{
        console.log("Success saving channel detail. Save Date");
      }
    });
    callback(null, conversationPayload);
  };

  middleware.after = function(message, conversationResponse, callback) {
    console.log("Inside After Method: " + JSON.stringify(conversationResponse));
    fb_id = message.user;
    console.log("FB id of user: " + fb_id);
    
    //experiment for username starts here
    checkBalance(conversationResponse, callback);
    console.log("Check Balance is called");
    //experiment ends here

    if(typeof conversationResponse !== 'undefined' && typeof conversationResponse.output !== 'undefined'){
      if(conversationResponse.output.action === 'check_balance'){
        return checkBalance(conversationResponse, callback);
      }
    }
    var lastActivityTime = new Date();
    console.log("Date: " + JSON.stringify(lastActivityTime));
    storage.channels.save({id: message.channel, date: lastActivityTime, contextVar: conversationResponse.context}, function(err) {
      if(err){
        console.log("Warning: error saving channel details: " + JSON.stringify(err));
      }
      else{
        console.log("Success saving channel detail. Save ContextVar");
      }
    });
    callback(null, conversationResponse);
  };
};

module.exports.replyMessage = replyMessage;