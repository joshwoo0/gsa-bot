"use strict";

var _require = require('BotOperator/Event'),
  Event = _require.Event;
var _require2 = require("BotOperator/DBManager"),
  DBManager = _require2.DBManager;
var dblistener = DBManager.getInstance();
var debugRoom1 = DBManager.getChannelById('413027239498239');
dblistener.on(Event.MESSAGE, function (chat, channel) {
  var proto = debugRoom1.send('chat:\n' + JSON.stringify(chat));
  debugRoom1.send('channel:\n' + JSON.stringify(channel));
});
dblistener.start();