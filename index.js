// Libraries
const schedule = require("node-schedule");
const utils = require("./utils/utils.js");
const heart = require("./utils/heartbeat.js");
const updater = require("./utils/check_feeds.js");
const expirer = require("./utils/expire_messages.js");
const blogger = require("./utils/check_guild_blog.js");
const client = utils.client;
const fs = require("fs");

//Ok, let's kick it off...
client.once("ready", () => {
    // Set status once the bot is online
    client.user.setActivity("the wind...", { type: 2 });

    //Start the heartbeat
    const heartbeat = new heart.Heartbeat();
    if (process.env.heart_type === 'push') {
        heartbeat.startPushing();
    } else if (process.env.heart_type === 'socket') {
        heartbeat.startSocket();
    }

    // Set the job schedule and content
    schedule.scheduleJob("01 01 */2 * * * ", function () {
        // Load feedUrls from a file
        const feedUrls = JSON.parse(fs.readFileSync("./data/feedUrls.json"));
        updater.iterateFeedUrls(feedUrls, client);
    });

    if (process.env.allow_expiry === "True") {
        console.log(`Enabling expiry. Messages expire after ${process.env.expiry_days} days.`);
        schedule.scheduleJob("01 15 05 * * *", function () {
            expirer.startExpirationCheck(client);
        });
    }

    if (process.env.check_blog === "True") {
        console.log(`Enabling guild blog checking!`);
        schedule.scheduleJob("01 */15 * * * *", function () {
            const guildBlog = JSON.parse(fs.readFileSync("./data/guildBlog.json"));
            blogger.checkBlog(guildBlog, client);
        });
    }
});

client.login(process.env.BOT_TOKEN);
