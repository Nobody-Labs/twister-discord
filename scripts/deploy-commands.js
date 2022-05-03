const fs = require('fs');
const { REST } = require('@discordjs/rest');
require('dotenv').config();
const {
	DISCORD_CLIENT_ID,
	DISCORD_GUILD_ID,
	DISCORD_BOT_TOKEN,
    // DISCORD_ADMIN_ROLE_ID,
    // DISCORD_CONTRIBUTOR_ROLE_ID,
} = process.env;


async function main() {
    const API_COMMANDS_URL = `/applications/${DISCORD_CLIENT_ID}/guilds/${DISCORD_GUILD_ID}/commands`;

    const commandFiles = fs.readdirSync('./src/commands').filter(
        file => file.endsWith('.js')
    );

    const commandsBody = [];
    for (const file of commandFiles) {
        const command = require(`../src/commands/${file}`);
        commandsBody.push(command.data.toJSON())
    };

    const rest = new REST({ version: '9' }).setToken(DISCORD_BOT_TOKEN);
    // delete all existing commands
    const commands = await rest.get(API_COMMANDS_URL);
    commands.forEach(async command => {
        console.log(await rest.delete(`${API_COMMANDS_URL}/${command.id}`));
    });
    console.log(await rest.get(API_COMMANDS_URL));

    try {
        await rest.put(API_COMMANDS_URL, { body: commandsBody });
        console.log('Successfully registered application commands.')
    } catch(err) {
        console.error(err);
    };

    // discord now makes you manage permissions in the discord client on desktop
    // try {
    //     const adminPermissions = {
    //         permissions: [
    //             {
    //                 id: DISCORD_ADMIN_ROLE_ID,
    //                 type: 1,
    //                 permission: true
    //             }
    //         ]
    //     };

    //     const commands = await rest.get(API_COMMANDS_URL);
    //     for (const command of commands) {
    //         if (!command.default_permission) {
    //             if (command.name === 'register') {
    //                 await rest.put(
    //                     `${API_COMMANDS_URL}/${command.id}/permissions`,
    //                     { body: {
    //                         permissions: [
    //                             {
    //                                 id: DISCORD_CONTRIBUTOR_ROLE_ID,
    //                                 type: 1,
    //                                 permission: true
    //                             },
    //                             ...adminPermissions.permissions
    //                         ]
    //                     }}
    //                 );  
    //             } else {
    //                 await rest.put(
    //                     `${API_COMMANDS_URL}/${command.id}/permissions`,
    //                     { body: adminPermissions }
    //                 );
    //             }
    //         }
    //     };
    //     console.log('Successfully registered application command permissions.');
    // } catch(err) {
    //     console.error(err);
    // }
}

main()
    .then(() => process.exit(0))
    .catch(err => {
        console.log(err);
        process.exit(1);
    });