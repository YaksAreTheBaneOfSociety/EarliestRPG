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
		let saveData = fs.readFileSync("save.json") // reads the json file
		let inventory = JSON.parse(saveData)[0] // turns json into js
		let skills = JSON.parse(saveData)[1] // turns json into js
		let locationsActions = JSON.parse(saveData)[2]
		var randomProperty = function (obj) {
			var keys = Object.keys(obj);
			return keys[ keys.length * Math.random() << 0];
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
		let interactionUser = interaction.user
		let time = interaction.options.getInteger('time')
		const typeString = interaction.options.getString('category');	
		let forageType = typeString
		let locIndex = locationsActions.findIndex(element => element.id === interactionUser.id)
		if (locIndex == -1){
			let userObject = {
				id: interactionUser.id,
				location: '',
				action: 'foraging'
			}
			locationsActions.push(userObject)
		}else{
			if(locationsActions[locIndex].action != ''){
				interaction.reply("You grow an extra set of hands? Finish what you're doing before starting another action.")
				return
			}
		}
		locIndex = locationsActions.findIndex(element => element.id === interactionUser.id)
		interaction.reply(`${interactionUser} has started foraging`)
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
		if(time > skills[skillsIndex].foraging.level*10){
			interaction.channel.send(`You cannot forage for more than ${skills[skillsIndex].foraging.level*10} seconds at your current foraging level. Foraging for maximum time possible.`)
			time = skills[skillsIndex].foraging.level*10
		}
		locationsActions[locIndex].action='foraging'
		save(interaction)
		let i = time
		let totalXP = 0
		function loopTilTimeFinished() {         //  create a loop function
		setTimeout(function() {   //  call a 3s setTimeout when the loop is called
			saveData = fs.readFileSync("save.json") // reads the json file
			locationsActions = JSON.parse(saveData)[2]
			locIndex = locationsActions.findIndex(element => element.id === interactionUser.id)
			currentLocation = locationsActions[locIndex].location
			let xpEarned = 0
			if(forageType=='bait'){
				let forageableBait = {"worms":'forest',"leeches":'lake',"grubs":'forest',"minnows":'none',"bread":'town',"superbait":'none'}
				let itemToForage = randomProperty(inventory[invIndex].bait)
				if(forageableBait[itemToForage] == locationsActions[locIndex].location){
					let amountForaged = 0
					for (let j = 0; j < skills[skillsIndex].foraging.level; j++){
						if(Math.random() < 0.8+-20/(skills[skillsIndex].foraging.level+35)){
							amountForaged++
						}else{
							j=501
						}
					}
					if (amountForaged > 0){
						inventory[invIndex].bait[itemToForage]+=amountForaged
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
			totalXP+=xpEarned
			if (i > 0 && locationsActions[locIndex].action == 'foraging') {           //  if the counter < 10, call the loop function
				loopTilTimeFinished();             //  ..  again which will trigger another 
			}else{
				totalXP=Math.floor(totalXP)
				skills[skillsIndex].foraging.xp+=totalXP
				skills[skillsIndex] = levelUpCheck(skills,skillsIndex,'foraging',interaction,interactionUser)
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
				interaction.channel.send(`${interactionUser.username} has stopped foraging. Total XP earned: **${totalXP}**.`)
			}                       //  ..  setTimeout()
		}, 1000)
		}

		loopTilTimeFinished();                   //  start the loop

	},
};