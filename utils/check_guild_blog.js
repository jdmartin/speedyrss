// Setup parser for iterateFeedUrls
let Parser = require("rss-parser");
let parser = new Parser();

// Deal with previous responses
const fs = require("fs");
const guildBlogFile = "./data/guildBlog.json";
const lastPostFile = "./data/guildLast.json";
let guildBlog = {};
let lastPost = {};

// Load latest post link and blog url from JSON files
if (fs.existsSync(guildBlogFile)) {
  const blog = fs.readFileSync(guildBlogFile, "utf8");
  guildBlog = JSON.parse(blog);
}

if (fs.existsSync(lastPostFile)) {
  const previousPostData = fs.readFileSync(lastPostFile, "utf8");
  lastPost = JSON.parse(previousPostData);
}

// Functions
async function checkBlog(guildBlog, client) {
  for (const key in guildBlog) {
    const feedUrl = guildBlog[key];
    let feed = await parser.parseURL(feedUrl);

    const currentResponse = feed.items.length > 0 ? feed.items[0].link : "";
    if (lastPost[feedUrl] !== currentResponse) {
      console.log(
        `${guildBlog[key]} update posted at ${new Date().toLocaleString()};`
      );

      const updatesChannel = client.channels.cache.get(
        // NOTE: This uses a different channel than check_feeds does. You can change this.
        process.env.blog_updates_channel
      );

      // NOTE: This filter is specific to our guild. You can change it.
      if (feed.items[0].categories[0] === "Announcements") {
        if (updatesChannel) {
          let baseGuildURL = feedUrl.replace("/feed", "");
          updatesChannel.send({
            content: `"${feed.items[0].title}" has been added to ${key}!\n${baseGuildURL}/${feed.items[0].categories[0]}`,
            username: client.user.username,
            avatarURL: client.user.displayAvatarURL(),
          });
        }
        lastPost[feedUrl] = currentResponse;
      }
      // Write the updated guildBlog object to the JSON file
      fs.writeFileSync(lastPostFile, JSON.stringify(lastPost, null, 2), "utf8");
      console.log("Last post updated.");
    }
  }
}

module.exports = {
  checkBlog,
};
