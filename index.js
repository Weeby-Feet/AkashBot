const Discord = require('discord.js');
const token = require('./token.js').token;
const bot = new Discord.Client();

const ytdl = require('ytdl-core');
const queue = new Map();

var channel = '';

bot.on('ready', () => {
    console.log('AkashBot is now online!');
});

//Server members need to type this character beore their command for the bot to notice it
const PREFIX = '&'

//The bot listens for a message to be sent to any channel it can see
bot.on('message', message=> {

    var serverQueue;

    if(message.author.bot) return;
    if(!message.content.startsWith(PREFIX)) return;

    //The bot can only be communicated with in a server
    if(message.guild) {
      serverQueue = queue.get(message.guild.id);
    }
    else {
      return;
    }

    //Music function commands
    if(message.content.startsWith(`${PREFIX}play`)) {
      console.log("Playing");
      execute(message, serverQueue);
      return;
    }
    else if(message.content.startsWith(`${PREFIX}skip`)) {
      console.log("Skipping");
      skip(message, serverQueue);
      return;
    }
    else if(message.content.startsWith(`${PREFIX}stop`)) {
      console.log("Stopping");
      stop(message, serverQueue);
      return;
    }
    else if(message.content.startsWith(`${PREFIX}ping`)) {
      message.channel.send('Pong! My ping is ' + bot.ping + "ms");
    }
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
    else if(message.content.startsWith(`${PREFIX}leave`)) {
      if(!message.member || !message.member.voiceChannel) {
        return;
      }

      console.log("Bye!");
      message.channel.send("Bye!");
      message.member.voiceChannel.leave();
    }
    else if(message.content.startsWith(`${PREFIX}fuckoff`)) {
      if(!message.member || !message.member.voiceChannel) {
        message.reply('Join a voice channel before telling me to do that m8');
      }

      console.log("Fucking off");
      message.channel.send("Fuck you too " + message.member);
      message.member.voiceChannel.leave();
    }
    else if(message.content.startsWith(`${PREFIX}whoisfat`)) {
      message.channel.send('<@267946818254405642> is fat');
    }
    else if(message.content.startsWith(`${PREFIX}help`)) {
      console.log(message.author.username + " requested help");
      message.channel.send("Sent you a DM with my commands");
      message.author.send("Don't forget the &\nping - ping the bot\nSNA - play the soviet national anthem\nleave - make the bot leave, duh\nhelp - you already know what that does\nplay - play a song in a voice channel. you must include a youtube video link\nskip - skip the song\nstop - stop playing the song");
    }
})

//Allows the bot to be able to play music from Youtube
async function execute(message, serverQueue) {
  if(message.member === null || message.member.voiceChannel === null) {
    return;
    console.log("Member needs to be in a voice channel first");
  }

  const args = message.content.split(' ');

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

//Skip a song that is currently playing
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
