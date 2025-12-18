const { Event } = require('../../global_modules/BotOperator/Event');
const {DBManager} = require("../../global_modules/BotOperator/DBManager");

let dblistener = DBManager.getInstance()

let debugRoom1 = DBManager.getChannelById('413027239498239');

dblistener.on(Event.MESSAGE, (chat, channel) => {
    const proto =
    debugRoom1.send('chat:\n' + JSON.stringify(chat));
    debugRoom1.send('channel:\n' + JSON.stringify(channel));
});

dblistener.start()