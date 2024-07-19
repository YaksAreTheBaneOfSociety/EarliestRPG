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
		const category = interaction.options.getString('category');
		const buyItem = interaction.options.getString('buyitem') ?? false;
		const sellItem = interaction.options.getString('sellitem') ?? false;
		const quantity = interaction.options.getInteger('quantity') ?? 1;
		let interactionReply = ``
		if(buyItem != false && sellItem != false){
			interaction.reply(`You cannot buy and sell an item at the same time`)
		}
		function save(interaction){
			let jsonSave = JSON.stringify(playerSave) // turns js back into json
			//interaction.channel.send(`test: ${jsonSave}`)
			fs.writeFileSync("saves/save-"+targetUser.id+".json", jsonSave) // the json file is now the users variable
			//interaction.channel.send(`**SAVED SUCCESSFULLY**`)
		}

		let interactionUser = interaction.user
		const typeString = interaction.options.getString('category');	
		if(playerSave.locationsActions.action != ''){
			interaction.reply("You cannot shop while doing an action")
			return
		}
		if(playerSave.locationsActions.location != 'town'){
			interaction.reply(`You cannot shop at the ${playerSave.locationsActions.location}. Try going to the town.`)
			return
		}
		if(playerSave.inventory.coins == null){
			playerSave.inventory.coins = {coins:0}
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
			let buyIndex = purchaseableItems[category].findIndex(element => element.item === buyItem)
			if(buyIndex == -1){
				interaction.reply(`${buyItem} is not a valid item`)
				return
			}else if(playerSave.inventory.coins.coins < purchaseableItems[category][buyIndex].cost*quantity){
				interaction.reply(`${quantity} ${buyItem} costs ${purchaseableItems[category][buyIndex].cost*quantity} EarliestCoins. You only have ${playerSave.inventory.coins.coins}.`)
				return
			}else{
				playerSave.inventory.coins.coins-=purchaseableItems[category][buyIndex].cost*quantity
				if(playerSave.inventory[category][buyItem]==null){
					playerSave.inventory[category][buyItem]=purchaseableItems[category][buyIndex].uses*quantity
				}else{
					playerSave.inventory[category][buyItem]+=purchaseableItems[category][buyIndex].uses*quantity
				}
				interaction.reply(`Purchased ${quantity} ${buyItem} for ${purchaseableItems[category][buyIndex].cost*quantity} EarliestCoins. You now have ${playerSave.inventory.coins.coins} EarliestCoins.`)
			}
		}else if(sellItem != false && sellableItems[category] != null){
			if(sellItem != false){
				if(sellableItems[category][sellItem] == null){
					interaction.reply(`${sellItem} is not a valid item`)
				}else{
					if(playerSave.inventory[category][sellItem] >= quantity){
						playerSave.inventory.coins.coins+=sellableItems[category][sellItem]*quantity
						playerSave.inventory[category][sellItem]-=quantity
						interaction.reply(`Sold ${quantity} ${sellItem} for ${sellableItems[category][sellItem]*quantity} EarliestCoins. You now have ${playerSave.inventory.coins.coins} EarliestCoins.`)
					}else{
						interaction.reply(`You do not have ${quantity} ${sellItem}`)
					}
				}
			}
		}else{
			if(purchaseableItems[category] == null){
				interaction.reply(`There are currently no ${category} items for sale.`)
			}else{
				interactionReply = `**${category} items for sale**`
				for (const [key, value] of Object.entries(purchaseableItems[category])) {
					interactionReply+=`\n*${value.item}* - ${value.name} can be purchased for ${value.cost} EarliestCoins`
				}
				interactionReply+=`\nYou have **${playerSave.inventory.coins.coins}** EarliestCoins`
				interaction.reply(interactionReply)
			}
		}

		save(interaction)
	},
};