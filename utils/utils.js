require("dotenv").config();

const { Client, GatewayIntentBits, Partials } = require("discord.js");

const myPartials = [Partials.Channel, Partials.Message, Partials.Reaction];

const myIntents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages];

const client = new Client({
  intents: myIntents,
  partials: myPartials,
});

module.exports = {
  client: client,
};
