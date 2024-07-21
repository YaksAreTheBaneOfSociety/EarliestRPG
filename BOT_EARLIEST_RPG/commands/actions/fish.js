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
		var randomElement = function (array) {
			return array[array.length * Math.random() << 0]
		}
		function save(interaction){
			let jsonSave = JSON.stringify(playerSave) // turns js back into json
			//interaction.channel.send(`test: ${jsonSave}`)
			fs.writeFileSync("saves/save-"+targetUser.id+".json", jsonSave) // the json file is now the users variable
			//interaction.channel.send(`**SAVED SUCCESSFULLY**`)
		}
		var levelUpCheck = function (skill,interaction,interactionUser){
			if(playerSave.skills[skill].level<500){
				xpNeeded=175*playerSave.skills[skill].level
				if(playerSave.skills[skill].xp>=xpNeeded){
					playerSave.skills[skill].xp-=xpNeeded
					playerSave.skills[skill].level++
					interaction.channel.send(`${interactionUser} leveled up ${skill} to **${playerSave.skills[skill].level}**`)
				}
			}
			return(playerSave.skills)
		}
		function catchFish(bait, catchTier, interaction, user){
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
			if(fishCaught in playerSave.inventory.fish){
				playerSave.inventory.fish[fishCaught]++
			}else{
				playerSave.inventory.fish[fishCaught] = 1
			}
			return(playerSave.inventory)
		}
		let interactionUser = interaction.user
		const type1String = interaction.options.getString('type1');	
		const type2String = interaction.options.getString('type2') ?? false;	
		const type3String = interaction.options.getString('type3') ?? false;
		let baitType = type1String
		if(playerSave.locationsActions.action != ''){
			interaction.reply("You grow an extra set of hands? Finish what you're doing before starting another action.")
			return
		}
		if(playerSave.locationsActions.location != 'lake'){
			interaction.reply(`You cannot fish at the ${playerSave.locationsActions.location}. Try going to the *lake*.`)
			return
		}
		interaction.reply(`${interactionUser} has started fishing`)
		if(!('fish' in playerSave.inventory)){
			playerSave.inventory.fish={}
		}

		if(playerSave.inventory.bait[baitType]==0){
			interaction.channel.send(`${interactionUser} has no ${baitType}`)
			return;
		}
		if(!(baitType in playerSave.inventory.bait)){
			interaction.channel.send(`${interactionUser} USED FISH WRONG. LOSER.`)
			return;
		}
		playerSave.locationsActions.action='fishing'
		save(interaction)
		let totalXP = 0
		function loopTilNoBait() {         //  create a loop function
			setTimeout(function() {   //  call a 3s setTimeout when the loop is called
				saveData = fs.readFileSync("saves/save-"+targetUser.id+".json") // reads the json file
				playerSave = JSON.parse(saveData)
				playerSave.inventory.bait[baitType]--
				let catchChance = playerSave.skills.fishing.level/111
				if (catchChance>0.90){
					catchChance=0.90
				}
				let rareCatchChance = playerSave.skills.fishing.level/1500
				if (rareCatchChance>0.10){
					rareCatchChance=0.10
				}
				let legendaryCatchChance = playerSave.skills.fishing.level/25000
				if (legendaryCatchChance>0.01){
					legendaryCatchChance=0.01
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
					let multipliers = {'':4,'catch': 2.5,'rare':4,'legendary':10}
					xpEarned*=multipliers[catchType]
				}
				if(catchType!=''){
					playerSave.inventory = catchFish(baitType, catchType, interaction, interactionUser)
				}else{
					if(Math.random() < 0.8+-20/(playerSave.skills.fishing.level+35)){
						playerSave.inventory.bait.minnows++
						interaction.channel.send(`${interactionUser.username} caught a minnow.`)
					}
				}
				if(playerSave.inventory.bait[baitType] == 0){
					if(baitType == type1String && playerSave.skills.fishing >= 50){
						baitType = type2String
					}
					if(baitType == type2String && playerSave.skills.fishing >= 100){
						baitType = type3String
					}
				}
				totalXP+=xpEarned
				playerSave.skills.fishing.xp+=xpEarned
				playerSave.skills = levelUpCheck('fishing',interaction,interactionUser)
				save(interaction)
				if (playerSave.inventory.bait[baitType] > 0 && playerSave.locationsActions.action == 'fishing') {           //  if the counter < 10, call the loop function
					loopTilNoBait();             //  ..  again which will trigger another 
				}else{
					playerSave.locationsActions.action = ''
					save(interaction)
					interaction.channel.send(`<@${interactionUser.id}> has stopped fishing. Total XP earned: ${totalXP}.`)
				}                       //  ..  setTimeout()
			}, 3000)
		}

		loopTilNoBait();                   //  start the loop

	},
};