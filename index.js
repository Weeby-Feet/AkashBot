const Discord = require('discord.js');
const token = require('./token.js').token;
const bot = new Discord.Client();

const ytdl = require('ytdl-core');
const YouTube = require('simple-youtube-api');
const youtube = new YouTube("AIzaSyDGh0OAIeql8rYKlS6w82FbrfxtLk7atYU");
const queue = new Map();

var channel = '';

bot.on('ready', () => {
    //Some fun output to mimic the ascii art logos of older software systems
    console.log("============================");
    console.log("||     GRID DYNAMICS      ||");
    console.log("============================");
    console.log("");
    console.log("======================================")
    console.log("|| WARNING: AkashBot is now online! ||");
    console.log("======================================")
    console.log("");
    console.log("==============================================================================");
    console.log("|| For operating instructions, please refer to operators manual             ||");
    console.log("|| Only authorized users are permitted to interact with AkashBot            ||");
    console.log("|| Grid Dynamics will not be held responsible for the actions of this bot   ||");
    console.log("==============================================================================");
    console.log("");
});

//Server members need to type this character beore their command for the bot to notice it
const PREFIX = '&'

//The bot listens for a message to be sent to any channel it can see
bot.on('message', message=> {

    var serverQueue;

    //If the message is from the bot itself or does not use the prefix, don't do anything
    if(message.author.bot) return;
    if(!message.content.startsWith(PREFIX)) return;

    //The bot can only be communicated with in a server, and not via direct message
    if(message.guild) {
      serverQueue = queue.get(message.guild.id);
    }
    else {
      return;
    }

    //Get the bot to play a song from youtube
    if(message.content.startsWith(`${PREFIX}play`)) {
      console.log("Playing");
      execute(message, serverQueue);
      return;
    }
    //Skip the song that the bot is currently playing
    else if(message.content.startsWith(`${PREFIX}skip`)) {
      console.log("Skipping");
      skip(message, serverQueue);
      return;
    }
    //Make the bot stop playing whatever it's playing
    else if(message.content.startsWith(`${PREFIX}stop`)) {
      console.log("Stopping");
      stop(message, serverQueue);
      return;
    }
    //Ping the bot to check it's latency
    else if(message.content.startsWith(`${PREFIX}ping`)) {
      message.channel.send('Pong! My ping is ' + bot.ping + "ms");
    }
    //Make the bot join the same voice channel as the person that summoned it
    else if(message.content.startsWith(`${PREFIX}join`)) {
      //Check that the user that summoned the bot is actually in a voice channel
      if(!message.member || !message.member.voiceChannel) {
        message.channel.send("Go join a voice channel first");
        return;
      }

      channel = message.member.voiceChannel;

      channel.join().then(connection => {
        //The company is enough of a function :)
      });
    }
    //You'll find out what this does eventually...
    else if(message.content.startsWith(`${PREFIX}SNA`)) {
      //Check that the user that summoned the bot is actually in a voice channel
      if(!message.member || !message.member.voiceChannel) {
        message.channel.send("Go join a voice channel first");
        return;
      }

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
    }
    //Make the bot leave the voice channel
    else if(message.content.startsWith(`${PREFIX}leave`)) {
      if(!message.member || !message.member.voiceChannel) {
        return;
      }

      console.log("Bye!");
      message.channel.send("Bye!");
      message.member.voiceChannel.leave();
    }
    //For those that are so inclined to use such vulgar language
    else if(message.content.startsWith(`${PREFIX}fuckoff`)) {
      if(!message.member || !message.member.voiceChannel) {
        message.reply('Join a voice channel before telling me to do that m8');
      }

      console.log("Fucking off");

      //You can change the max value depending on how many repsonses you want
      var min = 0;
      var max = 2;

      //Randomly choose a response
      var reply = Math.floor(Math.random() * (+max - +min)) + +min;

      switch(reply) {
        case 0:
          message.channel.send("Mind your ruddy language, my ears are not a toilet " + message.member);
          break;
        case 1:
          message.channel.send("Fuck you too " + message.member);
          break;
      }

      message.member.voiceChannel.leave();
    }
    //We all know who's fat
    else if(message.content.startsWith(`${PREFIX}whoisfat`)) {
      message.channel.send('<@267946818254405642> is fat');
    }
    //Get help
    else if(message.content.startsWith(`${PREFIX}help`)) {
      console.log(message.author.username + " requested help");
      message.channel.send("Sent you a DM with my commands");
      message.author.send("Don't forget the &\nping - ping the bot\nSNA - play the soviet national anthem\nleave - make the bot leave, duh\nhelp - you already know what that does\nplay - play a song in a voice channel. you must include a youtube video link\nskip - skip the song\nstop - stop playing the song\nwhoisfat - find out who is the fatest of them all");
    }
})

//Allows the bot to be able to play music from Youtube
async function execute(message, serverQueue) {
  if(message.member === null || message.member.voiceChannel === null) {
    return;
    console.log("Member needs to be in a voice channel first");
  }

  //Split up the command so it can be analysed
  const args = message.content.split(' ');

  //If the user is not in a voice channel, or the bot doesn't hav permission to join, alert the user
  const voiceChannel = message.member.voiceChannel;
  if(!voiceChannel) return message.channel.send('You need to be in a voice channel for me to sing to you');
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if(!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
    return message.channel.send('I need permissions to join and speak in your voice channel pretty please :)');
  }

  const songInfo = await ytdl.getInfo(args[1]);
  const song = {
    title: songInfo.title,
    url: songInfo.video_url,
  };

  if(!serverQueue) {
    const queueConstruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true,
    };


    queue.set(message.guild.id, queueConstruct);

    queueConstruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueConstruct.connection = connection;
      message.channel.send(`Now playing ${song.title}`);
      play(message.guild, queueConstruct.songs[0]);
    }
    catch(err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  }
  else {
    serverQueue.songs.push(song);
    console.log(serverQueue.songs);
    return message.channel.send(`${song.title} has been added to the queue`);
  }
}

//Skip the song that is currently playing
function skip(message, serverQueue) {
  if(!message.member.voiceChannel) return message.channel.send("You have to be in a voice channel to do that");
  if(!serverQueue) return message.channel.send("There is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
}

//Stop playing audio to the voice channel
function stop(message, serverQueue) {
  if(!message.member.voiceChannel) return message.channel.send("You have to be in a voice channel to do that");
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

//Play the song that is at the front of the queue
function play(guild, song) {
  const serverQueue = queue.get(guild.id);

  if(!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
    .on('end', () => {
      console.log('Music ended!');
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on('error', error => {
      console.error(error);
    });
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}

bot.login(token);
