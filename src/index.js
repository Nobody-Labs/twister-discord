const fs = require('fs');
const {
    Client,
    Collection,
    Intents
} = require('discord.js');
const {
    coordinator,
    controller,
    nitroFaucet,
    rinkarbyFaucet,
} = require('../lib/utils.ethers')
require('dotenv').config();

const { DISCORD_BOT_TOKEN } = process.env;

const commandFiles = fs.readdirSync('./src/commands')
    .filter(file => file.endsWith('.js'));

const discordEventFiles = fs.readdirSync('./src/discord-events')
    .filter(file => file.endsWith('.js'));

const ethEventFiles = fs.readdirSync('./src/eth-events')
    .filter(file => file.endsWith('.js'));

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.commands = new Collection();

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
};

for (const file of discordEventFiles) {
	const event = require(`./discord-events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	};
};

client.contracts = new Collection();
client.contracts.set('coordinator', coordinator);
client.contracts.set('controller', controller);
client.contracts.set('nitroFaucet', nitroFaucet());
client.contracts.set('rinkarbyFaucet', rinkarbyFaucet());

for (const file of ethEventFiles) {
    const event = require(`./eth-events/${file}`);
    coordinator.on(event.name, (...args) => event.execute(...args, client));
};

client.login(DISCORD_BOT_TOKEN);