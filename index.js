const Discord = require('discord.js');
const bot = new Discord.Client();

const token = 'NjIxMTUwMzk3MjA1MzE1NTg2.XXhKHQ.rO_VFTBLW7a0vS6P_2qOhBsl5nk';

bot.on('ready', () => {
    console.log('AkashBot is now online!');
})

bot.on('message', msg=> {
    if(msg.content === "Who is fat?") {
        msg.reply('Akash is fat');
    }
})

bot.on('message', msg=> {
    if(msg.content === "Who has Gilbert Syndrome?") {
        msg.reply('Akash has Gilbert Syndrome');
    }
})

bot.login(token);
