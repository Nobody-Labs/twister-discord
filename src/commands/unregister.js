const { SlashCommandBuilder } = require('@discordjs/builders');
const { isRegistered, unregister } = require('../../lib/utils.redis');

module.exports = {
	data: new SlashCommandBuilder()
	    .setName('unregister')
	    .setDescription('Unregisters a user!')
        .addUserOption(
            option => option.setName('user')
		    .setDescription('The user to unregister.')
            .setRequired(true)
        )
        .setDefaultPermission(false),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const user = interaction.options.getUser('user');
        const registered = await isRegistered(user);
        if (!registered)
            return interaction.followUp({
                content: `User ${user} is not registered.`,
                ephemeral: true
            });

        await unregister(user);
        return interaction.followUp({
            content: `Unregistered ${user}.`,
            ephemeral: true
        });
    },
};