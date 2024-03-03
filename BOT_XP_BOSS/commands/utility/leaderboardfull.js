const { SlashCommandBuilder,  Client, Collection, Events, GatewayIntentBits, Discord  } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboardfull')
		.setDescription('Replies with full leaderboard!'),
	async execute(interaction, xpObject, client) {
		// Sorting function
		function compareObjects(a, b) {
			if (a.level !== b.level) {
				return b.level - a.level; // Sort by 'level' descending
			} else {
				return b.xp - a.xp; // If levels are equal, sort by 'xp' descending
			}
		}

		// Sort objects array based on 'level' and 'xp'
		xpObject.sort(compareObjects);
		
		const topTen = xpObject.map((obj, index) => `#${index + 1} • ${obj.username} • level: ${obj.level}`);
		const topTenFormatted = topTen.join('\n')
		await interaction.reply("**House of KIKI (and the Union Dragon)'s leaderboard**\nWant to view more than the top 10 users? That's what you're doing dumbass\n" + topTenFormatted)
	},
};