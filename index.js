const { Telegraf } = require('telegraf');
const config = require('./config');


const bot = new Telegraf(config.BOT_TOKEN);



bot.command("start", (ctx) => {
    let name = ctx.from.first_name;
    ctx.reply(`Hello, $name,\n\nI am your new AI friend, and I’m built using JavaScript.`)
});



// ------------ Error handling ----------------
bot.catch((err) => {
    console.error('Error:', err);
});


// ------------ START-POLLING ----------------
bot.launch();
console.log("Bot Deployed Successfully !!");

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));



