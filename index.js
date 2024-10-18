const { Telegraf, Markup } = require('telegraf');
const config = require('./config');


const bot = new Telegraf(config.BOT_TOKEN);



bot.command("start", (ctx) => {
    let name = ctx.from.first_name;
    ctx.reply(`Hello, ${name},\n\nI am your new AI friend, and I’m built using JavaScript.`,
             Markup.inlineKeyboard([
             [Markup.button.url("Source", "https://github.com/Sumit0045/Jsbot")]]))
});




// Middleware to check if the user is an admin
const isAdmin = async (ctx) => {
    const chatId = ctx.chat.id;
    const userId = ctx.from.id;
    
    const member = await ctx.telegram.getChatMember(chatId, userId);
    return member.status === 'administrator' || member.status === 'creator';
};

// Command to ban a user
bot.command('ban', async (ctx) => {
    if (await isAdmin(ctx)) {
        const userId = ctx.message.reply_to_message?.from?.id; // Get the user ID from a replied message
        if (!userId) {
            return ctx.reply('Please reply to the user you want to ban.');
        }

        try {
            await ctx.telegram.banChatMember(ctx.chat.id, userId);
            ctx.reply(`User with ID ${userId} has been banned.`);
        } catch (error) {
            ctx.reply(`Error banning user: ${error.message}`);
        }
    } else {
        ctx.reply('You need to be an admin to use this command.');
    }
});

// Command to unban a user
bot.command('unban', async (ctx) => {
    if (await isAdmin(ctx)) {
        const userId = ctx.message.reply_to_message?.from?.id; // Get the user ID from a replied message
        if (!userId) {
            return ctx.reply('Please reply to the user you want to unban.');
        }

        try {
            await ctx.telegram.unbanChatMember(ctx.chat.id, userId);
            ctx.reply(`User with ID ${userId} has been unbanned.`);
        } catch (error) {
            ctx.reply(`Error unbanning user: ${error.message}`);
        }
    } else {
        ctx.reply('You need to be an admin to use this command.');
    }
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



