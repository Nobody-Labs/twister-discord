require('dotenv').config();
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const {
    getAddress,
    isAddress
} = require('../../lib/utils.ethers');
const {
    isRegistered,
    register
} = require('../../lib/utils.redis');

const { TS_CHANNEL_ID } = process.env;

function buildEmbed(contributor, arbiscanLink) {
    return new MessageEmbed()
	.setColor('#0099ff')
	.setTitle('TwisterCash Trusted Setup')
	.setDescription('New Registration')
    .addField('Eth Address', `${contributor}`)
    .addField('\u200B', '\u200B')
    .setURL(arbiscanLink)
    .setTimestamp();
};

module.exports = {
	data: new SlashCommandBuilder()
	    .setName('register')
	    .setDescription('Registers a user for the trusted setup ceremony!')
        .addStringOption(
            option => option.setName('address')
		    .setDescription(
                'Must be an address available in MetaMask browser wallet. Use a clean address!'
            )
            .setRequired(true)
        )
        .setDefaultPermission(false),
	async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });
        const user = interaction.user;

        try {
            const registered = await isRegistered(user);
            if (registered) {
                return interaction.followUp({
                    content: `${user} has already registered.`
                });
            }
        } catch (err) {
            return interaction.followUp({
                content: "Something went wrong!",
                ephemeral: true
            });
        }

        // check valid eth address
        const addr = interaction.options.getString('address');
        if (!isAddress(addr)) {
            return interaction.followUp({
                content: `"${addr}" is not a valid ethereum address`,
                ephemeral: true
            });
        };
        const contributor = getAddress(addr);

        // add address to contract
        const controller = client.contracts.get('controller');
        if (!controller) return interaction.followUp({
            content: "Something went wrong!",
            ephemeral: true
        });

        try {
            await register(user);
        } catch {
            return interaction.followUp({
                content: "Something went wrong!",
                ephemeral: true
            });
        }

        try {
            var tx = await controller.addContributor(contributor);
            console.log(tx.hash);
        } catch(err) {
            return interaction.followUp({
                content: "Something went wrong when submitting to testnet!",
                ephemeral: true
            });
        }

        const arbiscanLink = `https://testnet.arbiscan.io/tx/${tx.hash}`;
        const registerEmbed = buildEmbed(addr, arbiscanLink);

        // DM user
        user.send(
            'Welcome to the trusted setup ceremony. ' +
            'Visit https://twistercash.xyz/ceremony to get started.'
        );

        // notify discord channel
        client.channels.cache.get(TS_CHANNEL_ID).send({
            // content: `${user}`,
            embeds: [registerEmbed]
        });

        // reply to registrant
        return interaction.followUp({
            content: `Registered ${contributor}!`,
            ephemeral: true
        });
	},
}