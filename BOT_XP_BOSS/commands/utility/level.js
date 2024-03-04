const { SlashCommandBuilder,  Client, Collection, Events, GatewayIntentBits, Discord  } = require('discord.js');
const fs = require("fs")
const path = require("path")
module.exports = {
	data: new SlashCommandBuilder()
		.setName('level')
		.setDescription('Replies with level of selected user, or user who initiated command if none selected')
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('user to fetch level of')),
	async execute(interaction, xpObject, client) {
		const targetuser = interaction.options.getUser('user') ?? interaction.user;
		let xpIndex = xpObject.findIndex(element => element.id === targetuser.id)
		if(xpIndex == -1){
			let userxp = {
				id: targetuser.id,
				username: targetuser.username,
				xp: 0,
				level: 0,
				timeout: false
			}
			xpObject.push(userxp)
			xpIndex = xpObject.findIndex(element => element.id === targetuser.id)
		}
		let jsonXP = JSON.stringify(xpObject) // turns js back into json
		fs.writeFileSync("xp.json", jsonXP) // the json file is now the xp variable
		let xpPercentage = (xpObject[xpIndex].xp/(75+100*xpObject[xpIndex].level))
		const progressBar = ("■".repeat(Math.round(25*xpPercentage)) + "□".repeat(25-(Math.round(25*xpPercentage))) + " - " + Math.round(100*xpPercentage) + "%")
		await interaction.reply("**"+targetuser.username+"**\n----------------------------------------------\nLevel: " + xpObject[xpIndex].level + "\nXP: " + xpObject[xpIndex].xp + "/" + (75+100*xpObject[xpIndex].level) + "\n" + progressBar)
	},
};