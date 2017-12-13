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

/*controller.hears(['goodbyes'], ['direct_message', 'direct_mention', 'mention'], middleware.hear, function(bot, message) {
	  console.log("Goodbye intent detected");
	  bot.reply(message, message.watsonData.output.text.join('\n'));
	});*/

controller.hears('(.*)', 'message_received', function(bot, message) {
	/*if(message.watsonData.intents[0].intent !== 'goodbyes') {
		bot.reply(message, message.watsonData.output.text.join('\n'));
		console.log("Not a goodbye intent.");
		return;
	}
	else {
		console.log("Goodbye intent identified.");
	}*/
	bot.reply(message, message.watsonData.output.text.join('\n'));
});

module.exports.controller = controller;
module.exports.bot = bot;
