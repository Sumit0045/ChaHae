const { Telegraf } = require('telegraf');
const config = require('config');

const bot = new Telegraf(config.BOT_TOKEN);

// Basic command
bot.start((ctx) => ctx.reply('Welcome!'));
bot.help((ctx) => ctx.reply('Send me a sticker'));

// Respond to any text message
bot.on('text', (ctx) => {
    ctx.reply(`You said: ${ctx.message.text}`);
});

// Error handling
bot.catch((err) => {
    console.error('Error:', err);
});

// Start polling
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));



