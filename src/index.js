import {Client as DiscordClient} from 'discord.io';
import Starbound from 'starbound.js';
import winston from 'winston';
import SAIL from './sail';
import argv from './argv';

const hiSail = /^(?:hi|hello|aloha) s\.?a\.?i\.?l\.?/i;
const whosPlaying = /^(?:who(?:'?s|se| is)|(?:is )?anyone) (?:online|playing)\??$/i;

// logging
if (argv.log)
  winston.add(winston.transport.File, {filename: argv.log});
winston.level = argv.loglevel;

winston.info('Starting up...');
winston.info('loglevel: %s', winston.level);



// handle shutdowns
let shutdown = false;
function maybeShutdown() {
  if (shutdown) {
    if (!bot.connected && !sb.connected)
      process.exit();
    return true;
  }
  return false;
}



// Discord
const bot = new DiscordClient({token: argv.token});

let botReconnectTimeout = null;
let botReconnectBackoff = 5000;
function botReconnect() {
  winston.info('Trying to connect to Discord...');
  bot.connect();
  botReconnectBackoff = Math.min(botReconnectBackoff * 2, 600000);
  botReconnectTimeout = setTimeout(botReconnect, botReconnectBackoff);
}

bot.on('ready', function(event) {
  winston.info('Connected to Discord as %s (%s)', bot.username, bot.id.toString());
  setStarboundStatus();

  botReconnectBackoff = 10000;
  if (botReconnectTimeout) {
    clearTimeout(botReconnectTimeout);
    botReconnectTimeout = null;
  }
});

bot.on('message', function(user, userId, channelId, message, event) {
  winston.debug('Received message:', {user, userId, channelId, message, event});
  if (user == 'Baughb' && /^!announce(?:ment)?\s+(.+)$/i.test(message) && sb.connected) {
    winston.info('Sending announcement to Starbound: %s', RegExp.$1);
    sb.broadcast(RegExp.$1);
  } else if (whosPlaying.test(message)) {
    if (sb.connected) {
      winston.info('Getting list of Starbound players...');
      sb.listUsers(function(message) {
        if (bot.connected) {
          const users = message.users.map(u => u.username);
          winston.info('Users found:', {users});
          bot.sendMessage({to: channelId, message: SAIL.users(users)});
        }
      });
    } else {
      bot.sendMessage({to: channelId, message: SAIL.serverIsDown});
    }
  } else if (hiSail.test(message)) {
    bot.sendMessage({to: channelId, message: SAIL.greetings});
  }
});

bot.on('disconnect', function() {
  winston.info('Disconnected from Discord');
  if (!maybeShutdown() && !botReconnectTimeout)
    botReconnectTimeout = setTimeout(botReconnect, botReconnectBackoff);
});

botReconnect();



// Starbound
const sb = new Starbound(argv.host, argv.port);

let sbReconnectTimeout = null;
let sbReconnectBackoff = 5000;
function sbReconnect() {
  sb.connect(argv.password);
  sbReconnectBackoff = Math.min(sbReconnectBackoff * 2, 600000);
  sbReconnectTimeout = setTimeout(sbReconnect, sbReconnectBackoff);
}

function setStarboundStatus() {
  if (bot.connected) {
    if (sb.connected) {
      bot.setPresence({game: 'Starbound'});
    } else {
      bot.setPresence({idle_since: Date.now()});
    }
  }
}

sb.on('connect', function(successful) {
  if (successful) {
    winston.info('Connected to Starbound');
    setStarboundStatus();
  } else {
    winston.error('Could not authenticate with Starbound');
    cleanup();
  }

  sbReconnectBackoff = 10000;
  if (sbReconnectTimeout) {
    clearTimeout(sbReconnectTimeout);
    sbReconnectTimeout = null;
  }
});

sb.on('error', function(err) {
  winston.error('Starbound error:', {err});
});

sb.on('close', function() {
  winston.info('Disconnected from Starbound');
  if (!maybeShutdown() && !sbReconnectTimeout) {
    setStarboundStatus();
    sbReconnectTimeout = setTimeout(sbReconnect, sbReconnectBackoff);
  }
});

sbReconnect();



// Other stuff
function cleanup(err) {
  shutdown = true;
  if (err)
    winston.error('Uncaught Exception:', {err});

  winston.info('Shutting down...');
  if (bot.connected)
    bot.disconnect();
  if (sb.connected)
    sb.disconnect();

  if (botReconnectTimeout) {
    clearTimeout(botReconnectTimeout);
    botReconnectTimeout = null;
  }
  if (sbReconnectTimeout) {
    clearTimeout(sbReconnectTimeout);
    sbReconnectTimeout = null;
  }

  // if there was an uncaught exception, we'll forcibly shutdown, but
  // we'll wait a second to see if we can gracefully shutdown...
  if (err) {
    setTimeout(function() {
      winston.warn('Forcibly shutting down...');
      process.exit();
    }, 1000);
  }
}

process.on('uncaughtException', cleanup);
process.on('SIGINT', cleanup);

