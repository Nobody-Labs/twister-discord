require('dotenv').config();
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { getAddress } = require('../../lib/utils.ethers');

function buildEmbed(contractAddress, currentContributor, totalContributions) {
    return new MessageEmbed()
	    .setColor('#0099ff')
	    .setTitle('TS Coordinator')
	    .setDescription('Trusted Setup Ceremony Coordinator')
        .addField('Contract Address', `${contractAddress}`)
        .addField('currentContributor', `${currentContributor}`)
        .addField('#contributions', `${totalContributions}`, true)
        .setTimestamp();
};

module.exports = {
	data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Shows information about the coordinator contract'), 
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });
        const coordinator = client.contracts.get('coordinator');
        if (!coordinator) return;

        const contractAddress = getAddress(coordinator.address);        
        const [
            currentContributor,
            /* latestIndex */,
            totalContributions,
            /* latestIpfsHash */
        ] = await coordinator.latestInfo();
        const infoEmbed = buildEmbed(
            contractAddress,
            currentContributor,
            totalContributions
        );
        interaction.followUp({ embeds: [infoEmbed] });
	}
};