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
				.addChoices(
					{ name: 'bait', value: 'bait' },
					{ name: 'fish', value: 'fish' },
					{ name: 'combat', value: 'combat' },
					{ name: 'consumables', value: 'consumables' },
					{ name: 'ore', value: 'ore' }
				)
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
		if(playerSave.inventory.coins.coins == null){
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
			],
			ore:[{name: 'Expanded Ore Pouch 1 (20 slots)',
				cost: 1000,
				item: 'ore pouch1',
				uses: 10,
				max: 20
			},
			{name: 'Expanded Ore Pouch 2 (50 slots)',
				cost: 5000,
				item: 'ore pouch2',
				uses: 30,
				max: 50,
				min: 20
			},
			{name: 'Upgradeable Ore Pouch (+10 slots, repeatable)',
				cost: 5000,
				item: 'ore pouch3',
				uses: 10,
				max: 200,
				min: 50
			}
			],
			consumables:[
				{	name: '',
					cost: 100,
					item: 'tiny health potion',
					uses: 1
				},
				{	name: '',
					cost: 400,
					item: 'small health potion',
					uses: 1
				},
				{	name: '',
					cost: 750,
					item: 'medium health potion',
					uses: 1
				},
				{	name: '',
					cost: 1800,
					item: 'large health potion',
					uses: 1
				},
				{	name: '',
					cost: 3500,
					item: 'giant health potion',
					uses: 1
				}
			],
			combat:[
				{	name: '',
					cost: 150,
					item: 'sharpened stick',
					value: {"damage":2}
				},
				{	name: '',
					cost: 500,
					item: 'rough iron club',
					value: {"damage":"1d4"}
				},
				{	name: '',
					cost: 1500,
					item: 'dull spear',
					value: {"damage":"2d3"}
				},
				{	name: '',
					cost: 5000,
					item: 'steel longsword',
					value: {"damage":"3d4"}
				},
				{	name: '',
					cost: 25000,
					item: 'steel greatsword',
					value: {"damage":"2d8+1"}
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
			},
			ore:{
				stone: 1,
				"coal": 5,
                "iron ire": 100,
                "copper ore": 10,
                "tin ore": 10,
                "lead ore": 100,
                "zinc ore": 100,
                "silver ore": 100,
                "nickel ore": 100,
                "gold ore": 100,
                "platinum ore": 100,
                "rough amethyst": 100,
                "cobalt ore": 100,
                "titanium ore": 100,
                "rough emerald": 100,
                "rough ruby": 100,
                "rough sapphire": 100,
                "uranium ore": 100,
                "rough diamond": 100,
			},
			combat:{

			},
			consumables:{
                "tiny health potion": 50,
                "small health potion": 200,
                "medium health potion": 375,
                "large health potion": 900,
                "giant health potion": 1750
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
				const invItem = buyItem.replace(/\d+$/, '');
				const maximum = purchaseableItems[category][buyIndex].max ?? null
				const minimum = purchaseableItems[category][buyIndex].min ?? null
				if(minimum != null){
					if(playerSave.inventory[category][invItem]!=null){
						if(playerSave.inventory[category][invItem] < minimum){
							interaction.reply(`You cannot purchase ${purchaseableItems[category][buyIndex].name} yet.`)
							return
						}
					}
				}
				if(maximum != null){
					if(playerSave.inventory[category][invItem]==null){
						if(purchaseableItems[category][buyIndex].uses*quantity>maximum){
							interaction.reply(`You cannot buy ${quantity} of ${purchaseableItems[category][buyIndex].name}.`)
							return
						}
						playerSave.inventory[category][invItem]=purchaseableItems[category][buyIndex].uses*quantity
						playerSave.inventory.coins.coins-=purchaseableItems[category][buyIndex].cost*quantity
					}else{
						if(purchaseableItems[category][buyIndex].uses*quantity+playerSave.inventory[category][invItem] > maximum){
							interaction.reply(`You cannot buy ${quantity} of ${purchaseableItems[category][buyIndex].name}.`)
							return
						}
						playerSave.inventory.coins.coins-=purchaseableItems[category][buyIndex].cost*quantity
						playerSave.inventory[category][invItem]+=purchaseableItems[category][buyIndex].uses*quantity
					}
				}else{
					if(purchaseableItems[category][buyIndex].hasOwnProperty('value')){
						if(playerSave.inventory[category][invItem]==null){
							playerSave.inventory[category][invItem]=purchaseableItems[category][buyIndex].value
							playerSave.inventory.coins.coins-=purchaseableItems[category][buyIndex].cost
						}else{
							interaction.reply(`You already have a ${buyItem}`)
						}
					}else{
						if(playerSave.inventory[category][invItem]==null){
							playerSave.inventory[category][invItem]=purchaseableItems[category][buyIndex].uses*quantity
							playerSave.inventory.coins.coins-=purchaseableItems[category][buyIndex].cost*quantity
						}else{
							playerSave.inventory[category][invItem]+=purchaseableItems[category][buyIndex].uses*quantity
							playerSave.inventory.coins.coins-=purchaseableItems[category][buyIndex].cost*quantity
						}
					}
				}
				interaction.reply(`Purchased ${quantity} ${buyItem} for ${purchaseableItems[category][buyIndex].cost*quantity} EarliestCoins. You now have ${playerSave.inventory.coins.coins} EarliestCoins.`)
			}
		}else if(sellItem != false && sellableItems[category] != null){
			if(sellItem != false){
				if(sellableItems[category][sellItem] == null && category != "combat"){
					interaction.reply(`${sellItem} is not a valid item`)
				}else if(category != "combat"){
					if(playerSave.inventory[category][sellItem] >= quantity){
						playerSave.inventory.coins.coins+=sellableItems[category][sellItem]*quantity
						playerSave.inventory[category][sellItem]-=quantity
						interaction.reply(`Sold ${quantity} ${sellItem} for ${sellableItems[category][sellItem]*quantity} EarliestCoins. You now have ${playerSave.inventory.coins.coins} EarliestCoins.`)
					}else{
						interaction.reply(`You do not have ${quantity} ${sellItem}`)
					}
				}else{
					if(1 == quantity){	
						if(playerSave.inventory[category][sellItem].hasOwnProperty('price')){
							playerSave.inventory.coins.coins+=playerSave.inventory[category][sellItem].price
							interaction.reply(`Sold ${quantity} ${sellItem} for ${playerSave.inventory[category][sellItem].price} EarliestCoins. You now have ${playerSave.inventory.coins.coins} EarliestCoins.`)
							delete playerSave.inventory[category][sellItem]
						}else{
							interaction.reply(`${sellItem} cannot be sold`)
						}
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