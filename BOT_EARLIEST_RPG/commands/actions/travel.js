const { SlashCommandBuilder,  Client, Collection, Events, GatewayIntentBits, Discord  } = require('discord.js');
const fs = require("fs")
const path = require("path")
module.exports = {
	data: new SlashCommandBuilder()
		.setName('travel')
		.setDescription('travels to target location')
		.addStringOption(option =>
			option.setName('location')
				.setDescription('location to travel to')
				.setRequired(true)
				),
	async execute(interaction, client) {
		let saveData = fs.readFileSync("save.json") // reads the json file
		let inventory = JSON.parse(saveData)[0] // turns json into js
		let skills = JSON.parse(saveData)[1] // turns json into js
		let locationsActions = JSON.parse(saveData)[2]
		let interactionUser = interaction.user
		const locations = ['lake','town','abandoned general mine','forest']
		const locationToGo = interaction.options.getString('location');
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
		}
		locIndex = locationsActions.findIndex(element => element.id === interactionUser.id)
		if(locationsActions[locIndex].action == ''){
			if(locations.includes(locationToGo)){
				locationsActions[locIndex].location = locationToGo
				interaction.reply(`${interactionUser} traveled to the ${locationsActions[locIndex].location}`)
				save(interaction)
			}else{
				interaction.reply(`${locationToGo} is not a valid location.`)
			}
		}else{
			interaction.reply(`You cannot travel while busy`)
		}
	},
};