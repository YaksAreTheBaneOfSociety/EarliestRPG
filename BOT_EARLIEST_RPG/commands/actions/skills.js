const { SlashCommandBuilder,  Client, Collection, Events, GatewayIntentBits, Discord  } = require('discord.js');
const fs = require("fs")
const path = require("path")
module.exports = {
	data: new SlashCommandBuilder()
		.setName('skills')
		.setDescription('shows user skills'),
	async execute(interaction, client) {
		let saveData = fs.readFileSync("save.json") // reads the json file
		let inventory = JSON.parse(saveData)[0] // turns json into js
		let skills = JSON.parse(saveData)[1] // turns json into js
		let locationsActions = JSON.parse(saveData)[2]
		let interactionUser = interaction.user
		let skillsIndex = skills.findIndex(element => element.id === interactionUser.id)
		if (skillsIndex == -1){
			let userObject = {
				id: interactionUser.id,
				fishing: {
					level: 1,
					xp: 0
				},
				foraging: {
					level: 1,
					xp: 0
				}
			}
			skills.push(userObject)
		}
		skillsIndex = skills.findIndex(element => element.id === interactionUser.id)
		let interactionReply = `**${interactionUser}'s CURRENT SKILLS**`
		for (const [key, value] of Object.entries(skills[skillsIndex])) {
			if(key != 'id'){
				interactionReply+=`\n${key} skill is **${value.level}**. current ${key} xp is **${value.xp}**`
			}
		}
		interaction.reply(interactionReply)
	},
};