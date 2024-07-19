const { SlashCommandBuilder,  Client, Collection, Events, GatewayIntentBits, Discord  } = require('discord.js');
const fs = require("fs")
const path = require("path")
module.exports = {
	data: new SlashCommandBuilder()
		.setName('forage')
		.setDescription('forage')
		.addStringOption(option =>
			option.setName('category')
				.setDescription('foraging category to search for')
				.setRequired(true)
				)
		.addIntegerOption(option =>
			option.setName('time')
			.setDescription('time to forage for (seconds)')
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
		var randomProperty = function (obj) {
			var keys = Object.keys(obj);
			return keys[ keys.length * Math.random() << 0];
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
		let interactionUser = interaction.user
		let time = interaction.options.getInteger('time')
		const typeString = interaction.options.getString('category');	
		let forageType = typeString
		if(playerSave.locationsActions.action != ''){
			interaction.reply("You grow an extra set of hands? Finish what you're doing before starting another action.")
			return
		}
		interaction.reply(`${interactionUser} has started foraging`)
		if(time > playerSave.skills.foraging.level*10){
			interaction.channel.send(`You cannot forage for more than ${playerSave.skills.foraging.level*10} seconds at your current foraging level. Foraging for maximum time possible.`)
			time = playerSave.skills.foraging.level*10
		}
		playerSave.locationsActions.action='foraging'
		save(interaction)
		let i = time
		let xpRounder = 0
		let totalXP = 0
		function loopTilTimeFinished() {         //  create a loop function
		setTimeout(function() {   //  call a 3s setTimeout when the loop is called
			let saveData = fs.readFileSync("saves/save-"+targetUser.id+".json") // reads the json file
			playerSave = JSON.parse(saveData) // turns json into js
			let xpEarned = 0
			if(forageType=='bait'){
				let forageableBait = {"worms":'forest',"leeches":'lake',"grubs":'forest',"minnows":'none',"bread":'town',"superbait":'none'}
				let itemToForage = randomProperty(playerSave.inventory.bait)
				if(forageableBait[itemToForage] == playerSave.locationsActions.location){
					let amountForaged = 0
					for (let j = 0; j < playerSave.skills.foraging.level; j++){
						if(Math.random() < 0.8+-20/(playerSave.skills.foraging.level+35)){
							amountForaged++
						}else{
							j=501
						}
					}
					if (amountForaged > 0){
						playerSave.inventory.bait[itemToForage]+=amountForaged
						xpEarned = 2*amountForaged
						interaction.channel.send(`${interactionUser.username} has foraged and found ${amountForaged} ${itemToForage}.`)
					}else{
						xpEarned = 0.25
					}
				}else{
					xpEarned = 0.25
				}
			}else{
				interaction.channel.send(`"${forageType}" is not a valid foraging category. Available categories: bait`)
				return
			}
			i--
			xpRounder+=xpEarned
			if(xpRounder % 1 == 0){
				playerSave.skills.foraging.xp+=xpRounder
				playerSave.skills = levelUpCheck('foraging',interaction,interactionUser)
				totalXP+=xpRounder
				xpRounder=0
			}
			if(xpRounder > 1){
				playerSave.skills.foraging.xp+=xpRounder-(xpRounder%1)
				totalXP+=xpRounder-(xpRounder%1)
				playerSave.skills = levelUpCheck('foraging',interaction,interactionUser)
				xpRounder=xpRounder%1
			}
			save(interaction)
			if (i > 0 && playerSave.locationsActions.action == 'foraging') {           //  if the counter < 10, call the loop function
				loopTilTimeFinished();             //  ..  again which will trigger another 
			}else{
				playerSave.locationsActions.action = ''
				save(interaction)
				interaction.channel.send(`${interactionUser.username} has stopped foraging. Total XP earned: **${totalXP}**.`)
			}                       //  ..  setTimeout()
		}, 1000)
		}

		loopTilTimeFinished();                   //  start the loop

	},
};