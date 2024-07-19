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
		const locations = ['lake','town','abandoned general mine','forest']
		const locationToGo = interaction.options.getString('location');
		function save(interaction){
			let jsonSave = JSON.stringify(playerSave) // turns js back into json
			//interaction.channel.send(`test: ${jsonSave}`)
			fs.writeFileSync("saves/save-"+targetUser.id+".json", jsonSave) // the json file is now the users variable
			//interaction.channel.send(`**SAVED SUCCESSFULLY**`)
		}
		if(playerSave.locationsActions.action == ''){
			if(locations.includes(locationToGo)){
				if(locationToGo == "abandoned general mine"){
					playerSave.locationsActions.mine = {level:0,enemies:{},oreRemaining:0}
				}else{
					delete playerSave.locationsActions.mine
				}
				playerSave.locationsActions.location = locationToGo
				interaction.reply(`${interactionUser} traveled to the ${playerSave.locationsActions.location}`)
				save(interaction)
			}else{
				interaction.reply(`${locationToGo} is not a valid location.`)
			}
		}else{
			interaction.reply(`You cannot travel while busy`)
		}
	},
};