const { Telegraf, Markup } = require('telegraf');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { OWNER_ID, BOT_TOKEN } = require('./config');


const bot = new Telegraf(BOT_TOKEN);



// Start command
bot.command("start", (ctx) => {
    let name = ctx.from.first_name;
    ctx.reply(`Hello, ${name},\n\nI am your new AI friend, and I’m built using JavaScript.`,
        Markup.inlineKeyboard([
            [Markup.button.url("Source", "https://github.com/Sumit0045/ChaHae")]
        ]));
});


// Check if the user is an admin
const isAdmin = async (ctx) => {
    const chatId = ctx.chat.id;
    const userId = ctx.from.id;

    const member = await ctx.telegram.getChatMember(chatId, userId);
    return member.status === 'administrator' || member.status === 'creator';
};


// Ban command
bot.command('ban', async (ctx) => {
    if (await isAdmin(ctx)) {
        const userId = ctx.message.reply_to_message?.from?.id;
        const name = ctx.message.reply_to_message?.from?.first_name;
        const reason = ctx.message.text.split(' ').slice(1).join(' ');

        if (!userId) {
            return ctx.reply('Please reply to the user you want to ban.');
        }

        try {
            await ctx.telegram.banChatMember(ctx.chat.id, userId);
            let ban_msg = `<b>Ban Moment</b>\n\n<b>Name</b>: ${name}\n<b>User ID</b>: <code>${userId}</code>`;
            if (reason) {
                ban_msg += `\n<b>Reason</b>: ${reason}`;
            }

            ctx.replyWithHTML(ban_msg);
        } catch (error) {
            ctx.reply(`Error banning user: ${error.message}`);
        }
    } else {
        ctx.reply('You need to be an admin to use this command.');
    }
});


// Unban command
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
            let unban_msg = `<b>Unban Moment</b>\n\n<b>Name</b>: ${name}\n<b>User ID</b>: <code>${userId}</code>`;
            if (reason) {
                unban_msg += `\n<b>Reason</b>: ${reason}`;
            }

            ctx.replyWithHTML(unban_msg);
        } catch (error) {
            ctx.reply(`Error unbanning user: ${error.message}`);
        }
    } else {
        ctx.reply('You need to be an admin to use this command.');
    }
});


// Execute command function
async function aexec(code) {
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


// Reply or edit function
async function editOrReply(ctx, text) {
    if (ctx.message.reply_to_message) {
        await ctx.reply(text);
    } else {
        await ctx.reply(text);
    }
}


// Eval command
bot.command(['eval', 'c'], async (ctx) => {
    if (ctx.from.id !== OWNER_ID) return;

    const command = ctx.message.text.split(' ').slice(1).join(' ');
    if (!command) {
        return await editOrReply(ctx, "No command was given to execute!");
    }

    try {
        const start = Date.now();
        const output = await aexec(command);
        const runtime = Date.now() - start;

        let finalOutput = `<b>📕 Result:</b>\n<pre>${output}</pre>\n`;
        finalOutput += `<b>⏱️ Runtime:</b> ${runtime} ms`;

        if (finalOutput.length > 4096) {
            const filename = path.join(__dirname, 'output.txt');
            fs.writeFileSync(filename, output);
            await ctx.replyWithDocument(
                { source: filename },
                {
                    caption: `<b>🔗 Eval:</b>\n<code>${command}</code>\n\n<b>📕 Result:</b> Attached document`,
                }
            );
            fs.unlinkSync(filename);
        } else {
            await editOrReply(ctx, finalOutput);
        }
    } catch (error) {
        await editOrReply(ctx, `<b>ERROR:</b>\n<pre>${error.message}</pre>`);
    }
});



// Shell command
bot.command('sh', async (ctx) => {
    if (ctx.from.id !== OWNER_ID) return;

    const command = ctx.message.text.split(' ').slice(1).join(' ');
    if (!command) {
        return await editOrReply(ctx, "<b>Example :</b>\n/sh git pull");
    }

    try {
        const output = await aexec(command);
        await editOrReply(ctx, `<b>OUTPUT :</b>\n<pre>${output}</pre>`);
    } catch (error) {
        await editOrReply(ctx, `<b>ERROR :</b>\n<pre>${error}</pre>`);
    }
});



// Update command
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




// Error handling
bot.catch((err) => {
    console.error('Error:', err);
});

// Start polling
bot.launch();
console.log("Bot Deployed Successfully !!");

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));




