const { SlashCommandBuilder,  Client, Collection, Events, GatewayIntentBits, Discord  } = require('discord.js');
const fs = require("fs")
const path = require("path")
module.exports = {
	data: new SlashCommandBuilder()
		.setName('skills')
		.setDescription('shows user skills'),
	async execute(interaction, client) {
		let targetUser = interaction.user
		let playerSave = {}
		try{
			let saveData = fs.readFileSync("saves/save-"+targetUser.id+".json") // reads the json file
			playerSave = JSON.parse(saveData) // turns json into js
		}catch{
			let userObject = {
				inventory: {
					bait: {worms: 0, leeches: 0, grubs: 0, minnows: 0, bread: 0, superbait: 0},
					fish: {},
					coins: {coins: 0}
				},
				skills: {
					fishing: {
						level: 1,
						xp: 0
					},
					foraging: {
						level: 1,
						xp: 0
					}
				},
				locationsActions: {
					location: '',
					action: ''
				}
			}
			playerSave = userObject
		}
		let interactionUser = interaction.user
		let interactionReply = `**${interactionUser}'s CURRENT SKILLS**`
		for (const [key, value] of Object.entries(playerSave.skills)) {
			if(key != 'id'){
				interactionReply+=`\n${key} skill is **${value.level}**. current ${key} xp is **${value.xp}**`
			}
		}
		interaction.reply(interactionReply)
	},
};