const { Telegraf, Markup } = require('telegraf');
const config = require('./config');


const bot = new Telegraf(config.BOT_TOKEN);



bot.command("start", (ctx) => {
    let name = ctx.from.first_name;
    ctx.reply(`Hello, ${name},\n\nI am your new AI friend, and I’m built using JavaScript.`,
             Markup.inlineKeyboard([
             [Markup.button.url("Source", "https://github.com/Sumit0045/ChaHae")]]))
});



const isAdmin = async (ctx) => {
    const chatId = ctx.chat.id;
    const userId = ctx.from.id;
    
    const member = await ctx.telegram.getChatMember(chatId, userId);
    return member.status === 'administrator' || member.status === 'creator';
};




bot.command('ban', async (ctx) => {
    if (await isAdmin(ctx)) {
        const userId = ctx.message.reply_to_message?.from?.id;
        const name = ctx.message.reply_to_message?.from?.first_name;
        const reason = ctx.message.text.split(' ').slice(1).join(' ');

        if (!userId) {
            return ctx.reply('Please reply to the user you want to unban.');
        }

        try {
            await ctx.telegram.banChatMember(ctx.chat.id, userId);
            let ban_msg = `BAN MOMENT\n\nName: ${name}\nUser ID: ${userId}`;
            
            if (reason) {
                ban_msg += `\nReason: ${reason}`;
            }

            ctx.reply(ban_msg);
        } catch (error) {
            ctx.reply(`Error unbanning user: ${error.message}`);
        }
    } else {
        ctx.reply('You need to be an admin to use this command.');
    }
});



bot.command('unban', async (ctx) => {
    if (await isAdmin(ctx)) {
        const userId = ctx.message.reply_to_message?.from?.id;
        const name = ctx.message.reply_to_message?.from?.first_name;
        const reason = ctx.message.text.split(' ').slice(1).join(' ');

        if (!userId) {
            return ctx.reply('Please reply to the user you want to unban.');
        }

        try {
            await ctx.telegram.unbanChatMember(ctx.chat.id, userId);
            let unban_msg = `UNBAN MOMENT\n\nName: ${name}\nUser ID: ${userId}`;
            
            if (reason) {
                unban_msg += `\nReason: ${reason}`;
            }

            ctx.reply(unban_msg);
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



