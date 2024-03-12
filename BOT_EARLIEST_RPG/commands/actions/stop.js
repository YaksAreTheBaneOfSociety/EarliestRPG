const { SlashCommandBuilder,  Client, Collection, Events, GatewayIntentBits, Discord  } = require('discord.js');
const fs = require("fs")
const path = require("path")
module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('stops current action'),
	async execute(interaction, client) {
		let saveData = fs.readFileSync("save.json") // reads the json file
		let inventory = JSON.parse(saveData)[0] // turns json into js
		let skills = JSON.parse(saveData)[1] // turns json into js
		let locationsActions = JSON.parse(saveData)[2]
		let interactionUser = interaction.user
		function save(interaction){
			let jsonSave = JSON.stringify([inventory,skills,locationsActions]) // turns js back into json
			//interaction.channel.send(`test: ${jsonSave}`)
			fs.writeFileSync("save.json", jsonSave) // the json file is now the users variable
			//interaction.channel.send(`**SAVED SUCCESSFULLY**`)
		}
		let locIndex = locationsActions.findIndex(element => element.id === interactionUser.id)
		if (locIndex == -1){
			let userObject = {
				id: interactionUser.id,
				location: '',
				action: ''
			}
			locationsActions.push(userObject)
		}else{
			if(locationsActions[locIndex].action != ''){
				interaction.reply(`${interactionUser} stopped ${locationsActions[locIndex].action}`)
				locationsActions[locIndex].action = ''
				save(interaction)
			}else{
				interaction.reply(`${interactionUser} is already not doing anything`)
			}
		}
	},
};