const fs = require('fs');
const { REST } = require('@discordjs/rest');
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

const {
    DISCORD_CLIENT_ID,
	DISCORD_GUILD_ID,
    DISCORD_ADMIN_ROLE_ID,
    DISCORD_CONTRIBUTOR_ROLE_ID,
    DISCORD_BOT_TOKEN
} = process.env;

const API_COMMANDS_URL = `/applications/${DISCORD_CLIENT_ID}/guilds/${DISCORD_GUILD_ID}/commands`;

const commandFiles = fs.readdirSync('./src/commands')
    .filter(file => file.endsWith('.js'));

const discordEventFiles = fs.readdirSync('./src/discord-events')
    .filter(file => file.endsWith('.js'));

const ethEventFiles = fs.readdirSync('./src/eth-events')
    .filter(file => file.endsWith('.js'));

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.commands = new Collection();

const commandsBody = [];
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
    commandsBody.push(command.data.toJSON());
};

(async function() {
    const rest = new REST({ version: '9' }).setToken(DISCORD_BOT_TOKEN);

    try {
        await rest.put(API_COMMANDS_URL, { body: commandsBody });
        console.log('Successfully registered application commands.')
    } catch(err) {
        console.error(err);
    };

    try {
        const adminPermissions = {
            permissions: [
                {
                    id: DISCORD_ADMIN_ROLE_ID,
                    type: 1,
                    permission: true
                }
            ]
        };

        const commands = await rest.get(API_COMMANDS_URL);
        for (const command of commands) {
            if (!command.default_permission) {
                if (command.name === 'register') {
                    await rest.put(
                        `${API_COMMANDS_URL}/${command.id}/permissions`,
                        { body: {
                            permissions: [
                                {
                                    id: DISCORD_CONTRIBUTOR_ROLE_ID,
                                    type: 1,
                                    permission: true
                                },
                                ...adminPermissions.permissions
                            ]
                        }}
                    );  
                } else {
                    await rest.put(
                        `${API_COMMANDS_URL}/${command.id}/permissions`,
                        { body: adminPermissions }
                    );
                }
            }
        };
        console.log('Successfully registered application command permissions.');
    } catch(err) {
        console.error(err);
    }
})();

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
client.contracts.set('nitroFaucet', nitroFaucet);
client.contracts.set('rinkarbyFaucet', rinkarbyFaucet);

for (const file of ethEventFiles) {
    const event = require(`./eth-events/${file}`);
    coordinator.on(event.name, (...args) => event.execute(...args, client));
};

client.login(DISCORD_BOT_TOKEN);