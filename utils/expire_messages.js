const channelId = process.env.updates_channel;

async function startExpirationCheck(client) {
    console.log("Expiration check started.");
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() - process.env.expiry_days);

    // Fetch the specified channel
    const channel = client.channels.cache.get(channelId);
    if (!channel) {
        console.error(`Channel with ID ${channelId} not found.`);
        return;
    }

    console.log(`Checking messages in channel: ${channel.name}`);

    // Fetch the bot's messages in the channel
    const messages = await channel.messages.fetch({ limit: 100 });

    // Filter and delete old messages
    messages
        .filter((message) => {
            return message.author.bot && message.createdAt < expiryDate;
        })
        .forEach(async (message) => {
            try {
                await message.delete();
                console.log(`Deleted message: ${message.content}`);
            } catch (error) {
                console.error("Error deleting message:", error);
            }
        });
}

export { startExpirationCheck };
