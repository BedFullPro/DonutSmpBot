const mineflayer = require('mineflayer');
const express = require('express');
const { Authflow } = require('prismarine-auth');
const Movements = require('mineflayer-pathfinder').Movements;
const pathfinder = require('mineflayer-pathfinder').pathfinder;
const readline = require('readline');
const config = require('./settings.json');
const loggers = require('./logging.js');
const logger = loggers.logger;
const app = express();

app.listen(3000);

let shardCount = 0;
let spamCounter = 0; // Counter to track how many times the spam has been sent

function createBot() {
  const authflow = new Authflow(config['bot-account']['username'], config['bot-account']['authflow-cache-location']);
  const bot = mineflayer.createBot({
    host: config.server.ip,
    port: config.server.port,
    version: config.server.version,
    auth: config['bot-account']['type'],
    username: authflow.username,
    authflow: authflow
  });

  bot.loadPlugin(pathfinder);

  bot.once('spawn', async () => {
    const mcData = require('minecraft-data')(bot.version);
    bot.pathfinder.setMovements(new Movements(bot, mcData));
    console.log("Bot is ready.");

    logger.info("Bot joined the server");

    function randomSpamLoop() {
      const delay = Math.floor(Math.random() * 10000) + 5000; // 5-15 sec delay

      let spamMessage;
      // If spamCounter is less than 3, use the first message
      if (spamCounter < 3) {
        // Pick a random amount from 10K to 1M
        let randomAmount = Math.floor(Math.random() * 101) * 10 + 10; // Generates 10K, 20K, ..., 1M
        spamMessage = `DOUBLING MONEY IM QUITTING THE GAME FROM ${randomAmount}K TO 1M BE QUICK IM GONNA GET OFF`;
      } else {
        // After 3 messages, switch the range to 100K to 500K
        let randomAmount = Math.floor(Math.random() * 9) * 50 + 100; // Generates 100K, 150K, ..., 500K
        spamMessage = `DOUBLING MONEY IM QUITTING THE GAME FROM ${randomAmount}K TO 500K BE QUICK IM GONNA GET OFF`;
      }

      spamCounter++; // Increase the counter after sending a message

      setTimeout(() => {
        bot.chat(spamMessage);
        logger.info(`[SPAM] ${spamMessage}`);
        console.log(`[SPAM] ${spamMessage}`);
        randomSpamLoop(); // Loop the spam
      }, delay);
    }

    randomSpamLoop(); // Start spamming after bot spawns

    await new Promise(res => setTimeout(res, 5000));
    bot.chat("/afk");
    await new Promise(res => setTimeout(res, 2000));
    bot.clickWindow(49, 0, 0);

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.on('line', input => { if (input.trim()) bot.chat(input.trim()); });
  });

  setInterval(() => {
    shardCount++;
    logger.info(`Shards collected: ${shardCount}`);
    console.log(`Shards collected: ${shardCount}`);
  }, 60000);

  bot.on('message', message => {
    if (!message.json.translate || !message.json.translate.startsWith('chat.type.text')) {
      const msgText = message.toString().replace(/§./g, '');
      logger.info(`[CHAT] ${msgText}`);
      console.log(`[CHAT] ${msgText}`);
    }
  });

  bot.on('goal_reached', () => {
    if (config.position.enabled) logger.info(`Arrived at ${bot.entity.position}`);
  });

  bot.on('death', () => logger.warn(`Bot died at ${bot.entity.position}`));
  bot.on('kicked', reason => logger.warn(`Bot was kicked: ${reason}`));
  bot.on('error', err => logger.error(err.message));

  // Auto-reconnect logic
  bot.on('end', () => {
    logger.warn('Bot disconnected. Reconnecting...');
    setTimeout(createBot, 5000); // Reconnect after 5 seconds
  });

  if (config.utils['auto-reconnect']) {
    bot.on('end', () => {
      logger.warn('Bot disconnected. Reconnecting...');
      setTimeout(createBot, config.utils['auto-reconnect-delay']);
    });
  }
}

createBot();
