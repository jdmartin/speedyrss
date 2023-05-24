// Load the config file.
require("dotenv").config();

// Libraries
const schedule = require("node-schedule");
const utils = require("./utils/utils.js");
const heart = require("./utils/heartbeat.js");
const client = utils.client;
let Parser = require("rss-parser");
let parser = new Parser();

// Deal with previous responses
const fs = require("fs");
const previousResponsesFile = "./data/previous_responses.json";
let previousResponses = {};

// Load previous responses from JSON file
if (fs.existsSync(previousResponsesFile)) {
  const previousResponsesData = fs.readFileSync(previousResponsesFile, "utf8");
  previousResponses = JSON.parse(previousResponsesData);
}

// Load feedUrls from a file
const feedUrls = JSON.parse(fs.readFileSync("./data/feedUrls.json"));

// Functions
function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min) * 1000; // Convert to milliseconds
}

async function iterateFeedUrls(feedUrls) {
  for (const key in feedUrls) {
    const feedUrl = feedUrls[key];
    let feed = await parser.parseURL(feedUrl);
    const currentResponse = feed.items.length > 0 ? feed.items[0].title : "";
    if (previousResponses[feedUrl] !== currentResponse) {
      console.log(
        `Update detected for ${key} at ${new Date().toLocaleString()};`
      );
      const updatesChannel = client.channels.cache.get(
        process.env.updates_channel
      );

      if (updatesChannel) {
        let updateUrl = feedUrls[key].replace(".atom", "/latest");
        updatesChannel.send({
          content: `Update detected for ${key}! ${updateUrl}`,
          username: client.user.username,
          avatarURL: client.user.displayAvatarURL(),
        });
      }
      previousResponses[feedUrl] = currentResponse;
    }

    const pauseDuration = getRandomDelay(15, 30); // Space out requests for niceness...
    await new Promise((resolve) => setTimeout(resolve, pauseDuration));
  }
}

//Ok, let's kick it off...
client.once("ready", () => {
  // prints "Ready!" to the console once the bot is online
  client.user.setActivity("the wind...", { type: 2 });

  console.log("Speedy Standing By!");

  //Start the heartbeat
  const heartbeat = new heart.Heartbeat();
  heartbeat.startBeating();

  const job = schedule.scheduleJob("01 01 */2 * * * ", function () {
    iterateFeedUrls(feedUrls);
  });
});

client.login(process.env.BOT_TOKEN);
