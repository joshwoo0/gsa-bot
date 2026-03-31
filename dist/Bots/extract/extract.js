"use strict";

require("core-js/modules/es.array.concat.js");
require("core-js/modules/es.array.join.js");
require("core-js/modules/es.array.map.js");
require("core-js/modules/es.function.name.js");
require("core-js/modules/es.object.to-string.js");
var BotOperator = require('BotOperator').from(BotManager);
var bot = BotOperator.getCurrentBot();
var _require = require('BotOperator/Event'),
  Event = _require.Event;
bot.on(Event.MESSAGE, function (chat, channel) {
  if (chat.text === '/id') {
    channel.send("channel.id: ".concat(channel.id));
    channel.send("chat.user.id:\n".concat(channel.members.map(function (member) {
      return " - ".concat(member.name, ": ").concat(member.id);
    }).join('\n')));
  }
});
bot.start();