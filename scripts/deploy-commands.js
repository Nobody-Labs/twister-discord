const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();
const {
	DISCORD_CLIENT_ID,
	DISCORD_GUILD_ID,
	DISCORD_BOT_TOKEN
} = process.env;

const commandsRoute = Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID);
console.log(commandsRoute);

const commandFiles = fs.readdirSync('./src/commands').filter(
    file => file.endsWith('.js')
);

const commands = []
for (const file of commandFiles) {
	const command = require(`../src/commands/${file}`);
	commands.push(command.data.toJSON())
};

const rest = new REST({ version: '9' }).setToken(DISCORD_BOT_TOKEN);

rest.put(commandsRoute, { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);

rest.get(commandsRoute)
	.then(async commands => {
		commands.forEach(async command => {
			console.log(await rest.delete(`${commandsRoute}/${command.id}`));
		});
		console.log(await rest.get(commandsRoute));
	})