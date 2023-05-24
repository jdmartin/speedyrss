// Load the config file.
require("dotenv").config();

// Libraries
const schedule = require("node-schedule");
const utils = require("./utils/utils.js");
const heart = require("./utils/heartbeat.js");
const updater = require("./utils/check_feeds.js");
const expirer = require("./utils/expire_messages.js");
const client = utils.client;
const fs = require("fs");

//Ok, let's kick it off...
client.once("ready", () => {
  // Set status once the bot is online
  client.user.setActivity("the wind...", { type: 2 });

  // Log that the bot is up and running
  console.log("Speedy Standing By!");

  // Start the heartbeat
  const heartbeat = new heart.Heartbeat();
  heartbeat.startBeating();

  // Set the job schedule and content
  schedule.scheduleJob("01 01 */2 * * * ", function () {
    // Load feedUrls from a file
    const feedUrls = JSON.parse(fs.readFileSync("./data/feedUrls.json"));

    updater.iterateFeedUrls(feedUrls, client);
  });

  schedule.scheduleJob("01 15 05 * * *", function () {
    expirer.startExpirationCheck(client);
  });
});

client.login(process.env.BOT_TOKEN);
