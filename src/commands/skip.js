const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

function buildEmbed(arbiscanLink) {
    return new MessageEmbed()
	.setColor('#0099ff')
	.setTitle('TwisterCash Trusted Setup')
	.setDescription('Skipped Contributor')
    .setURL(arbiscanLink)
    .setTimestamp();
};

module.exports = {
	data: new SlashCommandBuilder()
	    .setName('skip')
	    .setDescription('Skips a user in the trusted setup ceremony!')
        .setDefaultPermission(false),
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });
        const controller = client.contracts.get('controller');
        if (!controller) return;

        const tx = await controller.skipContributor();
        const arbiscanLink = `https://testnet.arbiscan.io/tx/${tx.hash}`;
        const registerEmbed = buildEmbed(arbiscanLink);

        return interaction.followUp({
            content: `Skipped contributor.`,
            ephemeral: true
        });
    },
}