const { SlashCommandBuilder,  Client, Collection, Events, GatewayIntentBits, Discord  } = require('discord.js');
const fs = require("fs")
const path = require("path")
module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('stops current action'),
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
		function save(interaction){
			let jsonSave = JSON.stringify(playerSave) // turns js back into json
			//interaction.channel.send(`test: ${jsonSave}`)
			fs.writeFileSync("saves/save-"+targetUser.id+".json", jsonSave) // the json file is now the users variable
			//interaction.channel.send(`**SAVED SUCCESSFULLY**`)
		}
		if(playerSave.locationsActions.action != ''){
			interaction.reply(`${interactionUser} stopped ${playerSave.locationsActions.action}`)
			playerSave.locationsActions.action = ''
			save(interaction)
		}else{
			interaction.reply(`${interactionUser} is already not doing anything`)
		}
	},
};