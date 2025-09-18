// Libraries
import { readFileSync } from "node:fs";
import { scheduleJob } from "node-schedule";
import { iterateFeedUrls } from "./utils/check_feeds.js";
import { checkBlog } from "./utils/check_guild_blog.js";
import { startExpirationCheck } from "./utils/expire_messages.js";
import { client } from "./utils/utils.js";
import { Heartbeat } from "./utils/heartbeat.js";
const heart = new Heartbeat();

//Ok, let's kick it off...
client.once("clientReady", () => {
    // Set status once the bot is online
    client.user.setActivity("the wind...", { type: 2 });

    //Start the heartbeat
    if (process.env.heart_type === 'push') {
        heart.startPushing();
    } else if (process.env.heart_type === 'socket') {
        heart.startSocket();
    }

    // Set the job schedule and content
    scheduleJob("01 01 */2 * * * ", function () {
        // Load feedUrls from a file
        const feedUrls = JSON.parse(readFileSync("./data/feedUrls.json"));
        iterateFeedUrls(feedUrls, client);
    });

    if (process.env.allow_expiry === "True") {
        console.log(`Enabling expiry. Messages expire after ${process.env.expiry_days} days.`);
        scheduleJob("01 15 05 * * *", function () {
            startExpirationCheck(client);
        });
    }

    if (process.env.check_blog === "True") {
        console.log(`Enabling guild blog checking!`);
        scheduleJob("01 */15 * * * *", function () {
            const guildBlog = JSON.parse(readFileSync("./data/guildBlog.json"));
            checkBlog(guildBlog, client);
        });
    }
});

client.login(process.env.BOT_TOKEN);
