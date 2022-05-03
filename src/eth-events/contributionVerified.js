const { MessageEmbed } = require('discord.js');
const { VERIFICATIONS_CHANNEL_ID } = process.env;

const FAUCET_AMOUNT = '10000000000000000000000';

function buildEmbed({
    contributor,
    contributionIpfsHash,
    totalContributions,
    currentContributor,
    arbiscanLink
}) {
    return new MessageEmbed()
	    .setColor('#0099ff')
	    .setTitle('Contribution Verified!')
        .addField('Contributor', `${contributor}`)
        .addField('Contribution IPFS Hash', `${contributionIpfsHash}`)
        .addField('Total Contributions', `${totalContributions}`, true)
        .addField('Next Contributor', `${currentContributor}`)
        .setURL(arbiscanLink)
        .setTimestamp();
};

module.exports = {
	name: 'ContributionVerified',
	async execute(index, contributor, contributionIpfsHash, ethLogEvent, client) {
        const nitroFaucet = client.contracts.get('nitroFaucet');
        const rinkarbyFaucet = client.contracts.get('rinkarbyFaucet');
        const [
            currentContributor,
            /* latestIndex */,
            totalContributions, 
            /*latestIpfsHash */
        ] = await client.contracts.get('coordinator').latestInfo();

        client.channels.cache
            .get(VERIFICATIONS_CHANNEL_ID)
            .send({
                embeds: [
                    buildEmbed({
                        contributor,
                        contributionIpfsHash,
                        totalContributions,
                        currentContributor,
                        arbiscanLink: `https://testnet.arbiscan.io/tx/${ethLogEvent.transactionHash}`
                    })
                ]
            });

        const contributorNitroBalance = await nitroFaucet.balanceOf(contributor);
        if (!contributorNitroBalance.eq(FAUCET_AMOUNT)) {
            await nitroFaucet.transfer(contributor, FAUCET_AMOUNT);
        }

        const contributorRinkarbyBalance = await rinkarbyFaucet.balanceOf(contributor);
        if (!contributorRinkarbyBalance.eq(FAUCET_AMOUNT)) {
            await rinkarbyFaucet.transfer(contributor, FAUCET_AMOUNT);
        }
	}
};