const { SlashCommandBuilder,  Client, Collection, Events, GatewayIntentBits, Discord  } = require('discord.js');
const fs = require("fs")
const path = require("path")
module.exports = {
	data: new SlashCommandBuilder()
		.setName('fish')
		.setDescription('fish')
		.addStringOption(option =>
			option.setName('type1')
				.setDescription('bait type to use')
				.setRequired(true)
				)
		.addStringOption(option =>
			option.setName('type2')
				.setDescription('second bait type to use (requires Fishing level 50)')
				)
		.addStringOption(option =>
			option.setName('type3')
				.setDescription('third bait type to use (requires Fishing level 100)')
				),
	async execute(interaction, client) {
		let saveData = fs.readFileSync("save.json") // reads the json file
		let inventory = JSON.parse(saveData)[0] // turns json into js
		let skills = JSON.parse(saveData)[1] // turns json into js
		let locationsActions = JSON.parse(saveData)[2]
		var randomElement = function (array) {
			return array[array.length * Math.random() << 0]
		}
		function save(interaction){
			let jsonSave = JSON.stringify([inventory,skills,locationsActions]) // turns js back into json
			//interaction.channel.send(`test: ${jsonSave}`)
			fs.writeFileSync("save.json", jsonSave) // the json file is now the users variable
			//interaction.channel.send(`**SAVED SUCCESSFULLY**`)
		}
		var levelUpCheck = function (skills,skillsIndex,skill,interaction,interactionUser){
			if(skills[skillsIndex][skill].level<500){
				xpNeeded=175*skills[skillsIndex][skill].level
				if(skills[skillsIndex][skill].xp>=xpNeeded){
					skills[skillsIndex][skill].xp-=xpNeeded
					skills[skillsIndex][skill].level++
					interaction.channel.send(`${interactionUser} leveled up ${skill} to **${skills[skillsIndex][skill].level}**`)
				}
			}
			return(skills[skillsIndex])
		}
		function catchFish(bait, catchTier, interaction, inventory, invIndex, user){
			let fish = {
				worms: {
					catch: ['perch','bass'],
					rare: ['pike','sturgeon'],
					legendary: ['catfish','person in a fish costume']
				},
				leeches: {
					catch: ['perch','trout'],
					rare: ['cod','grouper'],
					legendary: ['clownfish','oarfish']
				},
				grubs: {
					catch: ['trout','bass'],
					rare: ['carp','mackerel'],
					legendary: ['stingray','jellyfish']
				},
				minnows: {
					catch: ['salmon','bass'],
					rare: ['herring','tuna'],
					legendary: ['lionfish','eel']
				},
				bread: {
					catch: ['salmon','trout'],
					rare: ['parrotfish','halibut'],
					legendary: ['pufferfish','alligator gar']
				},
				superbait: {
					catch: ['parrotfish','halibut','herring','tuna','carp','mackerel','cod','grouper','pike','sturgeon'],
					rare: ['pufferfish','alligator gar','lionfish','eel','stingray','jellyfish','clownfish','oarfish','catfish','person in a fish costume'],
					legendary: ['japanese spider crab','goblin shark','anglerfish']
				}
			}
			let fishCaught = randomElement(fish[bait][catchTier])
			interaction.channel.send(`${user.username} caught one ${fishCaught}`)
			if(fishCaught in inventory[invIndex].fish){
				inventory[invIndex].fish[fishCaught]++
			}else{
				inventory[invIndex].fish[fishCaught] = 1
			}
			return(inventory[invIndex])
		}
		let interactionUser = interaction.user
		const type1String = interaction.options.getString('type1');	
		const type2String = interaction.options.getString('type2') ?? false;	
		const type3String = interaction.options.getString('type3') ?? false;
		let baitType = type1String
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
				interaction.reply("You grow an extra set of hands? Finish what you're doing before starting another action.")
				return
			}
		}
		locIndex = locationsActions.findIndex(element => element.id === interactionUser.id)
		if(locationsActions[locIndex].location != 'lake'){
			interaction.reply(`You cannot fish at the ${locationsActions[locIndex].location}. Try going to the lake.`)
			return
		}
		interaction.reply(`${interactionUser} has started fishing`)
		let invIndex = inventory.findIndex(element => element.id === interactionUser.id)
		if (invIndex == -1){
			let userObject = {
				id: interactionUser.id,
				bait: {worms: 0, leeches: 0, grubs: 0, minnows: 0, bread: 0, superbait: 0},
				fish: {}
			}
			inventory.push(userObject)
		}
		invIndex = inventory.findIndex(element => element.id === interactionUser.id)
		let skillsIndex = skills.findIndex(element => element.id === interactionUser.id)
		if (skillsIndex == -1){
			let userObject = {
				id: interactionUser.id,
				fishing: {
					level: 1,
					xp: 0
				},
				foraging: {
					level: 1,
					xp: 0
				}
			}
			skills.push(userObject)
		}
		skillsIndex = skills.findIndex(element => element.id === interactionUser.id)

		if(!('fish' in inventory[invIndex])){
			inventory[invIndex].fish={}
		}

		if(inventory[invIndex].bait[baitType]==0){
			interaction.channel.send(`${interactionUser} has no ${baitType}`)
			return;
		}
		if(!(baitType in inventory[invIndex].bait)){
			interaction.channel.send(`${interactionUser} USED FISH WRONG. LOSER.`)
			return;
		}
		locationsActions[locIndex].action='fishing'
		save(interaction)
		let totalXP = 0
		function loopTilNoBait() {         //  create a loop function
			setTimeout(function() {   //  call a 3s setTimeout when the loop is called
				inventory[invIndex].bait[baitType]--
				let catchChance = skills[skillsIndex].fishing.level/100
				if (catchChance>0.95){
					catchChance=0.95
				}
				let rareCatchChance = skills[skillsIndex].fishing.level/750
				if (rareCatchChance>0.50){
					rareCatchChance=0.50
				}
				let legendaryCatchChance = skills[skillsIndex].fishing.level/2500
				if (legendaryCatchChance>0.10){
					legendaryCatchChance=0.10
				}
				catchRoll = Math.random()
				let catchType = ''
				let xpEarned = 1
				if (catchRoll<legendaryCatchChance){
					catchType = 'legendary'
					xpEarned=100
				}else if(catchRoll<rareCatchChance){
					catchType = 'rare'
					xpEarned=25
				}else if(catchRoll<catchChance){
					catchType = 'catch'
					xpEarned=10
				}
				if(baitType == "superbait"){
					let multipliers = {'catch': 2.5,'rare':4,'legendary':10}
					xpEarned*=multipliers[catchType]
				}
				totalXP+=xpEarned
				if(catchType!=''){
					inventory[invIndex] = catchFish(baitType, catchType, interaction, inventory, invIndex, interactionUser)
				}else{
					if(Math.random() < 0.8+-20/(skills[skillsIndex].fishing.level+35)){
						inventory[invIndex].bait.minnows++
						interaction.channel.send(`${interactionUser.username} caught a minnow.`)
					}
				}
				if(inventory[invIndex].bait[baitType] == 0){
					if(baitType == type1String && skills[skillsIndex].fishing >= 50){
						baitType = type2String
					}
					if(baitType == type2String && skills[skillsIndex].fishing >= 100){
						baitType = type3String
					}
				}
				saveData = fs.readFileSync("save.json") // reads the json file
				locationsActions = JSON.parse(saveData)[2]
				locIndex = locationsActions.findIndex(element => element.id === interactionUser.id)
				if (inventory[invIndex].bait[baitType] > 0 && locationsActions[locIndex].action == 'fishing') {           //  if the counter < 10, call the loop function
					loopTilNoBait();             //  ..  again which will trigger another 
				}else{
					skills[skillsIndex].fishing.xp+=totalXP
					skills[skillsIndex] = levelUpCheck(skills,skillsIndex,'fishing',interaction,interactionUser)
					locationsActions[locIndex].action = ''
					let skillsAtIndex = skills[skillsIndex]
					let invAtIndex = inventory[invIndex]
					let locAtIndex = locationsActions[locIndex]
					saveData = fs.readFileSync("save.json") // reads the json file
					inventory = JSON.parse(saveData)[0] // turns json into js
					skills = JSON.parse(saveData)[1] // turns json into js
					locationsActions = JSON.parse(saveData)[2]
					skillsIndex = skills.findIndex(element => element.id === interactionUser.id)
					invIndex = inventory.findIndex(element => element.id === interactionUser.id)
					locIndex = locationsActions.findIndex(element => element.id === interactionUser.id)
					if (locIndex == -1){
						let userObject = {
							id: interactionUser.id
						}
						locationsActions.push(userObject)
						locIndex = locationsActions.findIndex(element => element.id === interactionUser.id)
					}
					if (invIndex == -1){
						let userObject = {
							id: interactionUser.id
						}
						inventory.push(userObject)
						invIndex = inventory.findIndex(element => element.id === interactionUser.id)
					}
					if (skillsIndex == -1){
						let userObject = {
							id: interactionUser.id
						}
						skills.push(userObject)
						skillsIndex = skills.findIndex(element => element.id === interactionUser.id)
					}
					inventory[invIndex]=invAtIndex
					skills[skillsIndex]=skillsAtIndex
					locationsActions[locIndex]=locAtIndex
					save(interaction)
					interaction.channel.send(`${interactionUser.username} has stopped fishing. Total XP earned: ${totalXP}.`)
				}                       //  ..  setTimeout()
			}, 3000)
		}

		loopTilNoBait();                   //  start the loop

	},
};