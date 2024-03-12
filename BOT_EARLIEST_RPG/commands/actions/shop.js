const { SlashCommandBuilder,  Client, Collection, Events, GatewayIntentBits, Discord  } = require('discord.js');
const fs = require("fs")
const path = require("path")
module.exports = {
	data: new SlashCommandBuilder()
		.setName('shop')
		.setDescription('show purchaseable items or buy item if specified')
		.addStringOption(option =>
			option.setName('category')
				.setDescription('item category to buy/sell from')
				.setRequired(true)
				)
		.addStringOption(option =>
			option.setName('buyitem')
				.setDescription('item to buy')
				.setRequired(false)
				)
		.addStringOption(option =>
			option.setName('sellitem')
				.setDescription('item to sell')
				.setRequired(false)
				)
		.addIntegerOption(option =>
			option.setName('quantity')
			.setDescription('Quantity of item to buy/sell')),
	async execute(interaction, client) {
		let saveData = fs.readFileSync("save.json") // reads the json file
		let inventory = JSON.parse(saveData)[0] // turns json into js
		let skills = JSON.parse(saveData)[1] // turns json into js
		let locationsActions = JSON.parse(saveData)[2]
		const category = interaction.options.getString('category');
		const buyItem = interaction.options.getString('buyitem') ?? false;
		const sellItem = interaction.options.getString('sellitem') ?? false;
		const quantity = interaction.options.getInteger('quantity') ?? 1;
		let interactionReply = ``
		if(buyItem != false && sellItem != false){
			interaction.reply(`You cannot buy and sell an item at the same time`)
		}
		function save(interaction){
			let jsonSave = JSON.stringify([inventory,skills,locationsActions]) // turns js back into json
			//interaction.channel.send(`test: ${jsonSave}`)
			fs.writeFileSync("save.json", jsonSave) // the json file is now the users variable
			//interaction.channel.send(`**SAVED SUCCESSFULLY**`)
		}

		let interactionUser = interaction.user
		let time = interaction.options.getInteger('time')
		const typeString = interaction.options.getString('category');	
		let forageType = typeString
		let locIndex = locationsActions.findIndex(element => element.id === interactionUser.id)
		if (locIndex == -1){
			let userObject = {
				id: interactionUser.id,
				location: '',
				action: 'fishing'
			}
			locationsActions.push(userObject)
		}else{
			if(locationsActions[locIndex].action != ''){
				interaction.reply("You cannot shop while doing an action")
				return
			}
		}
		locIndex = locationsActions.findIndex(element => element.id === interactionUser.id)
		if(locationsActions[locIndex].location != 'town'){
			interaction.reply(`You cannot shop at the ${locationsActions[locIndex].location}. Try going to the town.`)
			return
		}
		let invIndex = inventory.findIndex(element => element.id === interactionUser.id)
		if (invIndex == -1){
			let userObject = {
				id: interactionUser.id,
				bait: {worms: 0, leeches: 0, grubs: 0, minnows: 0, bread: 0, superbait: 0},
				fish: {},
				coins: {coins: 0}
			}
			inventory.push(userObject)
		}
		invIndex = inventory.findIndex(element => element.id === interactionUser.id)
		if(inventory[invIndex].coins == null){
			inventory[invIndex].coins = {coins:0}
		}
		let purchaseableItems = {
			bait:[{	name: 'Loaf of Bread (20 uses)',
					cost: 20,//based off of level 10: 10% to catch common fish, 20 uses average 2 fish, 10 coins per fish
					item: 'bread',
					uses: 20
				},
				{	name: 'Can of SuperBait™ (10 uses)',
					cost: 500,//based off of level 100: 13% to catch legendary fish, 10 uses average ~1 leg. fish, 9 rare, 25 coins per rare fish, 250 per legendary. average 475
					item: 'superbait',
					uses: 10
				}
			]
		}
		let sellableItems = {
			fish:{
				perch: 10,
				bass: 10,
				salmon: 10,
				trout: 10,
				parrotfish: 25,
				halibut: 25,
				herring: 25,
				tuna: 25,
				carp: 25,
				mackerel: 25,
				cod: 25,
				grouper: 25,
				pike: 25,
				sturgeon: 25,
				pufferfish: 250,
				'alligator gar': 250,
				stingray: 250,
				jellyfish: 250,
				clownfish: 250,
				oarfish: 250,
				catfish: 250,
				'person in a fish costume': 250,
				lionfish: 250,
				eel: 250,
				'japanese spider crab': 1000,
				'goblin shark': 1000,
				'anglerfish': 1000
			}
		}
		if(buyItem != false && purchaseableItems[category] != null){
			if(buyItem != false){
				let buyIndex = purchaseableItems[category].findIndex(element => element.item === buyItem)
				if(buyIndex == -1){
					interaction.reply(`${buyItem} is not a valid item`)
					return
				}else if(inventory[invIndex].coins.coins < purchaseableItems[category][buyIndex].cost*quantity){
					interaction.reply(`${quantity} ${buyItem} costs ${purchaseableItems[category][buyIndex].cost*quantity} EarliestCoins. You only have ${inventory[invIndex].coins.coins}.`)
					return
				}else{
					inventory[invIndex].coins.coins-=purchaseableItems[category][buyIndex].cost*quantity
					if(inventory[invIndex][category][buyItem]==null){
						inventory[invIndex][category][buyItem]=purchaseableItems[category][buyIndex].uses*quantity
					}else{
						inventory[invIndex][category][buyItem]+=purchaseableItems[category][buyIndex].uses*quantity
					}
					interaction.reply(`Purchased ${quantity} ${buyItem} for ${purchaseableItems[category][buyIndex].cost*quantity} EarliestCoins. You now have ${inventory[invIndex].coins.coins} EarliestCoins.`)
				}
			}else{
				interactionReply = `**${category} items for sale**`
				for (const [key, value] of Object.entries(purchaseableItems[category])) {
					interactionReply+=`\n*${value.item}* - ${value.name} can be purchased for ${value.cost} EarliestCoins`
				}
				interactionReply+=`\nYou have **${inventory[invIndex].coins.coins}** EarliestCoins`
				interaction.reply(interactionReply)
			}
		}else if(sellItem != false && sellableItems[category] != null){
			if(sellItem != false){
				if(sellableItems[category][sellItem] == null){
					interaction.reply(`${sellItem} is not a valid item`)
				}else{
					if(inventory[invIndex][category][sellItem] >= quantity){
						inventory[invIndex].coins.coins+=sellableItems[category][sellItem]*quantity
						inventory[invIndex][category][sellItem]-=quantity
						interaction.reply(`Sold ${quantity} ${sellItem} for ${sellableItems[category][sellItem]*quantity} EarliestCoins. You now have ${inventory[invIndex].coins.coins} EarliestCoins.`)
					}else{
						interaction.reply(`You do not have ${quantity} ${sellItem}`)
					}
				}
			}
		}else{
			interaction.reply(`There are currently no ${category} items for sale.`)
		}

		save(interaction)
	},
};