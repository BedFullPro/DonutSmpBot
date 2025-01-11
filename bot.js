const mineflayer = require('mineflayer');
const express = require('express');
const { Authflow } = require('prismarine-auth');
const Movements = require('mineflayer-pathfinder').Movements;
const pathfinder = require('mineflayer-pathfinder').pathfinder;
const { GoalBlock, GoalXZ } = require('mineflayer-pathfinder').goals;
const readline = require('readline');
const config = require('./settings.json');
const loggers = require('./logging.js');
const logger = loggers.logger;
const app = express();

app.listen(3000);

let shardCount = 0;
let startTime = Date.now();

// Create the bot using Prismarine Authflow
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
    const defaultMove = new Movements(bot, mcData);
    bot.pathfinder.setMovements(defaultMove);
    console.log("Bot is ready and pathfinder initialized.");

    logger.info("Bot joined to the server");

    // Wait 5 seconds, execute /afk, and click slot 49
    try {
      await new Promise((res) => setTimeout(res, 5000)); // Wait 5 seconds
      bot.chat("/afk");
      console.log("[*] Executed /afk");

      // Short delay before interacting with slot 49
      await new Promise((res) => setTimeout(res, 2000)); // Adjust delay as needed

      const slotToClick = 49; // Specify slot 49
      bot.clickWindow(slotToClick, 0, 0); // Click slot 49
      console.log(`[*] Clicked on slot ${slotToClick}`);
    } catch (err) {
      console.error("[!] Error during /afk and slot interaction:", err);
    }

    // Set up the readline interface for chat input
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.on('line', (input) => {
      if (input.trim()) {
        bot.chat(input.trim());
        console.log(`You: ${input.trim()}`);
      }
    });
  });

  // Track uptime and shards collected
  setInterval(() => {
    shardCount++;
    const shardMessage = `\u001b[33mShards collected: ${shardCount}\u001b[0m`; // Yellow color for console output
    logger.info(`Shards collected: ${shardCount}`);
    console.log(shardMessage);
  }, 60000); // Every minute, increment shard count

  // Log non-player messages only
  bot.on('message', (message) => {
    if (!message.json.translate || !message.json.translate.startsWith('chat.type.text')) {
      const msgText = message.toString().replace(/§./g, ''); // Remove color codes
      logger.info(`[CHAT] ${msgText}`);
      console.log(`[CHAT] ${msgText}`);
    }
  });

  bot.on('goal_reached', () => {
    if (config.position.enabled) {
      logger.info(`Bot arrived at target location: ${bot.entity.position}`);
    }
  });

  bot.on('death', () => {
    logger.warn(`Bot has died and respawned at ${bot.entity.position}`);
  });

  bot.on('kicked', (reason) => {
    let reasonText;
    try {
      reasonText = JSON.parse(reason).text;
    } catch {
      reasonText = reason;
    }
    logger.warn(`Bot was kicked: ${reasonText}`);
  });

  bot.on('error', (err) => logger.error(`${err.message}`));

  // Auto-reconnect feature
  if (config.utils['auto-reconnect']) {
    bot.on('end', () => {
      logger.warn('Bot disconnected. Attempting to reconnect...');
      setTimeout(createBot, config.utils['auto-reconnect-delay']);
    });
  }
}

createBot();
