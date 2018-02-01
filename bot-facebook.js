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
var endConvo = false;

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
  endConvo = true;
  console.log("End Condition: " + endConvo);
  var endMessage = clone(message);
  endMessage.text = 'time out';
  middleware.interpret(bot, endMessage, function(){
    //processWatsonResponse(bot, endMessage);
    bot.reply(endMessage, endMessage.watsonData.output.text.join('\n'));
  });
  console.log("Conversation ended");
}

var processWatsonResponse = function(bot, message){
  console.log("Just heard the following message: " + JSON.stringify(message));
  if(message.watsonError){
    console.log("Watson Error: " + JSON.stringify(message.watsonError));
    console.log(message.watsonError);
    return bot.reply(message, "I'm sorry, but for technical reasons I can't respond to your message");
  }
  if(endConvo == false) {
    if(typeof message.watsonData.output !== 'undefined') {
      //send please wait to user
      //console.log("Message: " + JSON.stringify(message));
      bot.reply(message, message.watsonData.output.text.join('\n'));
    }

    if(message.watsonData.output.action === 'check_balance'){
          var newMessage = clone(message);
          newMessage.text = 'check new name';
          //send to Watson
          middleware.interpret(bot, newMessage, function(){
            //send results to user
            bot.reply(newMessage, newMessage.watsonData.output.text.join('\n'));
      });
    }

    if (message.watsonData.output.action && message.watsonData.output.action.check_balance) {
      console.log("Shoe Brand Only.");
      //setTimeout(function(){bot.reply(message, message.watsonData.output.text.join('\n\n'))},0);
      setTimeout(function(){
        var attachment = 
        {
          "type":"template",
          "payload":
          {
            "template_type":"generic",
            "elements":[
              {
                "title":message.watsonData.output.action.check_balance.title,
                "image_url":message.watsonData.output.action.check_balance.image,
                "default_action": message.watsonData.output.action.check_balance.default_action,
                "buttons":message.watsonData.output.action.check_balance.buttons
              }
            ]
          }
       }
       bot.reply(message, {
          attachment: attachment,
       });
      });
    }

    if (message.watsonData.output.action && message.watsonData.output.action.generic_template) {
        console.log("Generic template.");
        //setTimeout(function(){bot.reply(message, message.watsonData.output.text.join('\n\n'))},0);
        setTimeout(function(){
          var attachment = {
          "type":"template",
          "payload":{
            "template_type":"generic",
            "elements":[
              {
                "title":message.watsonData.output.action.generic_template.title,
                "image_url":message.watsonData.output.action.generic_template.image,
                "default_action": message.watsonData.output.action.generic_template.default_action,
                "buttons":message.watsonData.output.action.generic_template.buttons
              }
            ]
          }
        }
        bot.reply(message, {
          attachment: attachment,
        });
      });
    }

    if (message.watsonData.output.action && message.watsonData.output.action.shoe_brand_only) {
      console.log("Shoe Brand Only.");
      //setTimeout(function(){bot.reply(message, message.watsonData.output.text.join('\n\n'))},0);
      setTimeout(function(){
        var attachment = 
        {
          "type":"template",
          "payload":
          {
            "template_type":"generic",
            "elements":[
              {
                "title":message.watsonData.output.action.shoe_brand_only.title,
                "image_url":message.watsonData.output.action.shoe_brand_only.image,
                "default_action": message.watsonData.output.action.shoe_brand_only.default_action,
                "buttons":message.watsonData.output.action.shoe_brand_only.buttons
              }
            ]
          }
       }
       bot.reply(message, {
          attachment: attachment,
       });
      });
    }

    if (message.watsonData.output.action && message.watsonData.output.action.display_yes_no) {
      console.log("Shoe Brand Only.");
     
      setTimeout(function(){
        var attachment = 
        {
          "type":"template",
          "payload":
          {
            "template_type":"button",
            "elements":[
              {
                "title":message.watsonData.output.action.display_yes_no.title,
                "buttons":message.watsonData.output.action.display_yes_no.buttons
              }
            ]
          }
       }
       bot.reply(message, {
          attachment: attachment,
       });
      });
      //setTimeout(function(){bot.reply(message, message.watsonData.output.text.join('\n\n'))},0);
    }

    if (message.watsonData.output.action && message.watsonData.output.action.shoe_brand_and_type) {
      console.log("Shoe Brand Only.");
      //setTimeout(function(){bot.reply(message, message.watsonData.output.text.join('\n\n'))},0);
      setTimeout(function(){
        var attachment = 
        {
          "type":"template",
          "payload":
          {
            "template_type":"generic",
            "elements":[
              {
                "title":message.watsonData.output.action.shoe_brand_and_type.title,
                "image_url":message.watsonData.output.action.shoe_brand_and_type.image,
                "default_action": message.watsonData.output.action.shoe_brand_and_type.default_action,
                "buttons":message.watsonData.output.action.shoe_brand_and_type.buttons
              }
            ]
          }
       }
       bot.reply(message, {
          attachment: attachment,
       });
      });
    }

    if (message.watsonData.output.action && message.watsonData.output.action.save_full_record) {
      console.log("Save Full Record.");
      //setTimeout(function(){bot.reply(message, message.watsonData.output.text.join('\n\n'))},0);
      setTimeout(function(){
        var attachment = {
        "type":"template",
        "payload":{
          "template_type":"generic",
          "elements":[
            {
              "title":message.watsonData.output.action.save_full_record.title,
              "image_url":message.watsonData.output.action.save_full_record.image,
              "default_action": message.watsonData.output.action.save_full_record.default_action,
              "buttons":message.watsonData.output.action.save_full_record.buttons
            }
          ]
        }
      }
      bot.reply(message, {
        attachment: attachment,
      });
    });
  }

  }
  endConvo = false;
};

/*controller.hears('(.*)', 'message_received', function(bot, message) {
  bot.reply(message, message.watsonData.output.text.join('\n'));
});*/

controller.on('message_received', processWatsonResponse);

/*controller.on('facebook_postback', function(bot, message) {
  watsonMiddleware.readContext(message.user, function(err, context) {
    if (!context) {
      context = {};
    }
    //do something useful here
    setContext(context.user_name, function(err, result) {
      const newMessage = clone(message);
      newMessage.text = 'No';

      watsonMiddleware.sendToWatson(bot, newMessage, {postbackResult: 'success'}, function(err) {
        if (err) {
          newMessage.watsonError = error;
        }
        processWatsonResponse(bot, newMessage);
      });
    });
  });
});*/

controller.on('facebook_postback', function(bot, message){
  console.log("Trying to respond to facebook postback");
  bot.reply(message, message.payload);
});

module.exports.controller = controller;
module.exports.bot = bot;
module.exports.endConversation = endConversation;