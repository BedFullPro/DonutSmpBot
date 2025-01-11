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
let startTime = Date.now();

// Utility function to click on a window slot with retries
async function clickWindowWithRetries(bot, slot, mouseButton, mode, retries = 3, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      await bot.clickWindow(slot, mouseButton, mode);
      return;
    } catch (err) {
      await new Promise((res) => setTimeout(res, delay)); // Wait before retrying
    }
  }
  throw new Error(`Failed to click window slot ${slot} after ${retries} attempts`);
}

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
    console.log("[*] Connected to server");
    logger.info("Bot joined to the server");

    // Execute /settings and attempt to click on slot 10
    try {
      bot.chat("/settings");
      console.log("[*] Executed /settings");
      await new Promise((res) => setTimeout(res, 2000)); // Wait for the settings menu to open

      await clickWindowWithRetries(bot, 10, 0, 0); // Click slot 10
      console.log("[*] Clicked on slot 10 in settings menu");

      await new Promise((res) => setTimeout(res, 500)); // Small delay before closing
      bot.closeWindow(bot.currentWindow); // Close the currently open window
      console.log("[*] Closed the settings menu");
    } catch (err) {
      console.error("[!] Error interacting with settings menu:", err);
    }

    // Initialize pathfinder movements
    const mcData = require('minecraft-data')(bot.version);
    const defaultMove = new Movements(bot, mcData);
    bot.pathfinder.setMovements(defaultMove);

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
