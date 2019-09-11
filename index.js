const Discord = require('discord.js');
const token = require('./token.js').token;
const bot = new Discord.Client();

var channel = '';

bot.on('ready', () => {
    console.log('AkashBot is now online!');
});

//Server members need to type this character beore their command for the bot to notice it
const PREFIX = '&'

//The bot listens for a message to be sent to any channel it can see
bot.on('message', message=> {

    if(message.content === "who is fat") {
      message.channel.send('<@267946818254405642> is fat');
    }

    let args = message.content.substring(PREFIX.length).split(" ");

    switch(args[0]) {
      case 'ping':
        message.channel.send('pong');
        break;
      case 'SNA':
        console.log("Playing Soviet National Anthem");

        //Only true slav will understand
        message.channel.send("Да товарищ");

        channel = message.member.voiceChannel;
        console.log("Joining channel " + channel.name);

        channel.join().then(connection => {
          const dispatcher = connection.playFile('National Anthem of USSR.mp3');

          //When the song ends, leave the channel
          dispatcher.on("end", end => {
            channel.leave();
          });
        });
        break;

      case 'leave':
        //Say bye bye to server and developer. Good bot.
        console.log("Bye!");
        message.channel.send("Bye!");
        channel.leave();
    }

})

bot.login(token);
