const { Telegraf, Markup, session } = require('telegraf');
const { exec } = require('child_process');
const { StringIO } = require('stream');
const fs = require('fs');
const path = require('path');
const { OWNER_ID, BOT_TOKEN } = require('./config');



const bot = new Telegraf(BOT_TOKEN);



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








async function aexec(code, ctx) {
    return new Promise((resolve, reject) => {
        exec(`node -e "${code}"`, (error, stdout, stderr) => {
            if (error) {
                reject(stderr || error.message);
            } else {
                resolve(stdout);
            }
        });
    });
}



async function editOrReply(ctx, text) {
    if (ctx.message.reply_to_message) {
        await ctx.reply(text);
    } else {
        await ctx.reply(text);
    }
}

bot.command(['eval', 'c'], async (ctx) => {
    if (ctx.from.id !== OWNER_ID) return;

    const command = ctx.message.text.split(' ').slice(1).join(' ');
    if (!command) {
        return await editOrReply(ctx, "No command was given to execute!");
    }

    try {
        const start = Date.now();
        const output = await aexec(command, ctx);
        const runtime = Date.now() - start;

        const finalOutput = `<b>📕 ʀᴇsᴜʟᴛ :</b>\n<pre>${output}</pre>`;
        if (finalOutput.length > 4096) {
            const filename = path.join(__dirname, 'output.txt');
            fs.writeFileSync(filename, output);
            await ctx.replyWithDocument({ source: filename }, {
                caption: `<b>🔗 ᴇᴠᴀʟ :</b>\n<code>${command}</code>\n\n<b>📕 ʀᴇsᴜʟᴛ :</b> Attached document`,
            });
            fs.unlinkSync(filename);
        } else {
            await editOrReply(ctx, finalOutput);
        }
    } catch (error) {
        await editOrReply(ctx, `<b>ERROR :</b>\n<pre>${error}</pre>`);
    }
});


bot.command('sh', async (ctx) => {
    if (ctx.from.id !== OWNER_ID) return;

    const command = ctx.message.text.split(' ').slice(1).join(' ');
    if (!command) {
        return await editOrReply(ctx, "<b>Example :</b>\n/sh git pull");
    }

    try {
        const output = await aexec(command, ctx);
        await editOrReply(ctx, `<b>OUTPUT :</b>\n<pre>${output}</pre>`);
    } catch (error) {
        await editOrReply(ctx, `<b>ERROR :</b>\n<pre>${error}</pre>`);
    }
});


bot.command('update', async (ctx) => {
    if (ctx.from.id !== OWNER_ID) return;

    const msg = await ctx.reply("Pulling changes with the latest commits...");
    exec('git pull', async (error, stdout, stderr) => {
        if (error) {
            await msg.edit(`Error pulling changes: ${stderr}`);
        } else {
            await msg.edit("Changes pulled with the latest commits. Restarting bot now...");
            process.exit();
        }
    });
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



