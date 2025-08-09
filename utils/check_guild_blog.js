import { existsSync, readFileSync, writeFileSync } from "node:fs";

// Setup parser for iterateFeedUrls
import Parser from "rss-parser";
const parser = new Parser();

// Deal with previous responses
const guildBlogFile = "./data/guildBlog.json";
const lastPostFile = "./data/guildLast.json";
let guildBlog = {};
let lastPost = {};

// Load latest post link and blog url from JSON files
if (existsSync(guildBlogFile)) {
    const blog = readFileSync(guildBlogFile, "utf8");
    guildBlog = JSON.parse(blog);
}

if (existsSync(lastPostFile)) {
    const previousPostData = readFileSync(lastPostFile, "utf8");
    lastPost = JSON.parse(previousPostData);
}

// Functions
async function parseFeed(feedUrl) {
    try {
        const feed = await parser.parseURL(feedUrl);
        return feed;
    } catch (error) {
        // Handle any errors that occur during parsing
        console.error("Error parsing feed:", error);
        return null;
    }
}

async function checkBlog(guildBlog, client) {
    for (const key in guildBlog) {
        const feedUrl = guildBlog[key];
        const feed = await parseFeed(feedUrl);

        const currentResponse = feed.items[0].link

        if (lastPost[feedUrl] !== currentResponse) {
            console.log(`${guildBlog[key]} update detected in ${feed.items[0].categories[0]} at ${new Date().toLocaleString()};`);

            const updatesChannel = client.channels.cache.get(
                // NOTE: This uses a different channel than check_feeds does. You can change this.
                process.env.blog_updates_channel
            );

            // NOTE: This filter is specific to our guild. You can change it.
            if (feed.items[0].categories[0] === "Announcements") {
                if (updatesChannel) {
                    let baseGuildURL = feedUrl.replace("/feed", "");
                    let title = feed.items[0].title;
                    let category = feed.items[0].categories[0];
                    updatesChannel.send({
                        content: `"${title}" has been added to ${key}!\n${baseGuildURL}/${category}`,
                        username: client.user.username,
                        avatarURL: client.user.displayAvatarURL(),
                    });
                }
            }
            // Write the updated guildBlog object to the JSON file
            lastPost[feedUrl] = currentResponse;
            writeFileSync(lastPostFile, JSON.stringify(lastPost, null, 2), "utf8");
            console.log("Last post updated.");
        }
    }
}

export { checkBlog };
