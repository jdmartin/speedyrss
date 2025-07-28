// Setup parser for iterateFeedUrls
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

// Functions
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRandomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min) * 1000; // Convert to milliseconds
}

async function fetchFeedWithRetry(url, { retries = 1, delayMs = 30_000 } = {}) {
    let lastErr;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await parser.parseURL(url);
        } catch (err) {
            lastErr = err;
            if (attempt < retries) {
                console.warn(
                    `[${new Date().toISOString()}] Failed to fetch ${url} (attempt ${attempt + 1
                    }/${retries + 1}). Retrying in ${delayMs / 1000}s...`,
                    err?.message ?? err
                );
                await sleep(delayMs);
            }
        }
    }
    console.error(
        `[${new Date().toISOString()}] Giving up on ${url} after ${retries + 1
        } attempts.`,
        lastErr?.message ?? lastErr
    );
    return null; // signal caller to skip
}

async function iterateFeedUrls(feedUrls, client) {
    let didUpdate = false;

    for (const key in feedUrls) {
        const feedUrl = feedUrls[key];

        const feed = await fetchFeedWithRetry(feedUrl, {
            retries: 1, // first try + one retry after 30s
            delayMs: 30_000,
        });

        if (!feed || !feed.items || feed.items.length === 0) {
            console.warn(
                `[${new Date().toISOString()}] Skipping ${feedUrl} because feed or items are missing.`
            );
            const pauseDuration = getRandomDelay(15, 30);
            await sleep(pauseDuration);
            continue;
        }

        const currentResponse = feed.items[0].title ?? "";

        if (previousResponses[feedUrl] !== currentResponse) {
            didUpdate = true;
            console.log(
                `Update detected for ${key} at ${new Date().toLocaleString()};`
            );

            const updatesChannel = client.channels.cache.get(
                process.env.updates_channel
            );

            if (updatesChannel) {
                const updateUrl = feedUrls[key].replace(".atom", "/latest");
                updatesChannel.send({
                    content: `Update detected for ${key}! ${updateUrl}`,
                    username: client.user.username,
                    avatarURL: client.user.displayAvatarURL(),
                });
            }

            previousResponses[feedUrl] = currentResponse;
        }

        // Space out requests for niceness...
        const pauseDuration = getRandomDelay(15, 30);
        await sleep(pauseDuration);
    }

    if (didUpdate) {
        console.log("Responses File updated.");
        fs.writeFileSync(
            previousResponsesFile,
            JSON.stringify(previousResponses, null, 2),
            "utf8"
        );
    }
}

module.exports = {
    iterateFeedUrls,
};
