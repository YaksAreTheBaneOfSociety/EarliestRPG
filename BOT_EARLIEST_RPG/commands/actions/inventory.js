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
		let saveData = fs.readFileSync("save.json") // reads the json file
		let inventory = JSON.parse(saveData)[0] // turns json into js
		let skills = JSON.parse(saveData)[1] // turns json into js
		let locationsActions = JSON.parse(saveData)[2]
		let interactionUser = interaction.user
		let invIndex = inventory.findIndex(element => element.id === interactionUser.id)
		if (invIndex == -1){
			let userObject = {
				id: interactionUser.id,
				bait: {worms: 0, leeches: 0, grubs: 0, minnows: 0, bread: 0, superbait: 0},
				fish: {},
				coins: {coins:0}
			}
			inventory.push(userObject)
		}
		invIndex = inventory.findIndex(element => element.id === interactionUser.id)
		if(inventory[invIndex].coins == null){
			inventory[invIndex].coins = {coins:0}
		}
		let interactionReply = `**${interactionUser}'s current ${invType}**`
		if(!(invType in inventory[invIndex])){
			interactionReply=`${interactionUser} has no items of type: ${invType}`
			return;
		}
		let isEmpty=false
		for (const [key, value] of Object.entries(inventory[invIndex][invType])) {
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