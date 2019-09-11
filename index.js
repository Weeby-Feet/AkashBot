const Discord = require('discord.js');
const bot = new Discord.Client();

const token = 'NjIxMTUwMzk3MjA1MzE1NTg2.XXhT9w.liFoevq7VZE_SzNossFrQI5pkNE';

bot.on('ready', () => {
    console.log('AkashBot is now online!');

    const channel = bot.channels.get("346961010583666691");
    if(!channel) return console.error("This channel does not exit blin!");
    channel.join().then(connection => {
      //It worked!
      console.log("Successfully connected");
    }).catch(e => {
      //Error!
      console.error(e);
    });
});

const PREFIX = '&'

bot.on('message', message=> {

    let args = message.content.substring(PREFIX.length).split(" ");

    switch(args[0]) {
      case 'ping':
        message.channel.send('pong');
    }

})

bot.login(token);
