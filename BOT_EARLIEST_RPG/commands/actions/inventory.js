const { SlashCommandBuilder,  Client, Collection, Events, GatewayIntentBits, Discord  } = require('discord.js');
const fs = require("fs")
const path = require("path")
module.exports = {
	data: new SlashCommandBuilder()
		.setName('inventory')
		.setDescription('shows user inventory')
		.addStringOption(option =>
			option.setName('category')
				.setDescription('inventory category to show')
				.setRequired(true)
				.addChoices(
					{ name: 'bait', value: 'bait' },
					{ name: 'coins', value: 'coins' },
					{ name: 'fish', value: 'fish' }
				)
				),
	async execute(interaction, client) {
		const invType = interaction.options.getString('category')
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
		
		if(playerSave.inventory.coins == null){
			playerSave.inventory.coins = {coins:0}
		}
		let interactionReply = `**${interactionUser}'s current ${invType}**`
		if(!(invType in playerSave.inventory)){
			interactionReply=`${interactionUser} has no items of type: ${invType}`
			return;
		}
		let isEmpty=false
		for (const [key, value] of Object.entries(playerSave.inventory[invType])) {
			if(value != 0){
				interactionReply+=`\n${interactionUser} has ${value} ${key}`
				isEmpty=true
			}
		}
		if(isEmpty==false){
			interactionReply=`${interactionUser} has no items of type: ${invType}`
		}
		interaction.reply(interactionReply)
	},
};