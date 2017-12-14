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

var middleware = require('botkit-middleware-watson')({
	  username: process.env.CONVERSATION_USERNAME,
	  password: process.env.CONVERSATION_PASSWORD,
	  workspace_id: process.env.WORKSPACE_ID,
	  url: process.env.CONVERSATION_URL || 'https://gateway.watsonplatform.net/conversation/api',
	  version_date: '2017-05-26'
	});

var controller = Botkit.facebookbot({
  access_token: process.env.FB_ACCESS_TOKEN,
  verify_token: process.env.FB_VERIFY_TOKEN
});

var bot = controller.spawn();

//comment sa visual studio code
//return bot.startConversation(message, 'Hello there, good looking fellow.');
bot.say('Hello Fellow!');

controller.hears('goodbyes', 'message_received', middleware.hear, function(bot,message) {
	/*console.log("Goodbye Intent Identified");
	return bot.reply(message, "Bye! K.");*/ //regular response
	return bot.reply(message,{
	      text: "A more complex response",
	      icon_emoji: ":grin:"
	    }); //slightly complex response
	/* bot.reply(message, {
	        attachment: {
	            'type':'template',
	            'payload':{
	                 'template_type':'generic',
	                 'elements':[
	                   {
	                     'title':'Classic White T-Shirt',
	                     'image_url':'http://petersapparel.parseapp.com/img/item100-thumb.png',
	                     'subtitle':'Soft white cotton t-shirt is back in style',
	                     'buttons':[
	                       {
	                         'type':'web_url',
	                         'url':'https://petersapparel.parseapp.com/view_item?item_id=100',
	                         'title':'View Item'
	                       },
	                       {
	                         'type':'web_url',
	                         'url':'https://petersapparel.parseapp.com/buy_item?item_id=100',
	                         'title':'Buy Item'
	                       },
	                       {
	                         'type':'postback',
	                         'title':'Bookmark Item',
	                         'payload':'USER_DEFINED_PAYLOAD_FOR_ITEM100'
	                       }
	                     ]
	                   },
	                   {
	                     'title':'Classic Grey T-Shirt',
	                     'image_url':'http://petersapparel.parseapp.com/img/item101-thumb.png',
	                     'subtitle':'Soft gray cotton t-shirt is back in style',
	                     'buttons':[
	                       {
	                         'type':'web_url',
	                         'url':'https://petersapparel.parseapp.com/view_item?item_id=101',
	                         'title':'View Item'
	                       },
	                       {
	                         'type':'web_url',
	                         'url':'https://petersapparel.parseapp.com/buy_item?item_id=101',
	                         'title':'Buy Item'
	                       },
	                       {
	                         'type':'postback',
	                         'title':'Bookmark Item',
	                         'payload':'USER_DEFINED_PAYLOAD_FOR_ITEM101'
	                       }
	                     ]
	                   }
	                 ]
	               }
	        }
	    });*/
});

controller.hears('(.*)', 'message_received', function(bot, message) {
	var shoeType = message.match[0]; //message.match[1] to select the match
	if(shoeType === 'Nike'){
		return bot.reply (message, 'Nike it is!');
	}
	console.log("Controller Hears!!!");
	bot.reply(message, message.watsonData.output.text.join('\n'));
});

module.exports.controller = controller;
module.exports.bot = bot;
