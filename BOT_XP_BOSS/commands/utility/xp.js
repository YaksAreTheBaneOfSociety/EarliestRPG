const { SlashCommandBuilder,  Client, Collection, Events, GatewayIntentBits, Discord  } = require('discord.js');
const fs = require("fs")
const path = require("path")
let rolesLevels = [
	{
		'role': '1182169777825927178',
		'level': 1
	},
	{
		'role': '1182169821429907456',
		'level': 5
	},
	{
		'role': '1182169863821725727',
		'level': 10
	},
	{
		'role': '1182169907425718303',
		'level': 25
	},
	{
		'role': '1182169962899587153',
		'level': 50
	},
	{
		'role': '1182170032864755722',
		'level': 69
	},
	{
		'role': '1182170091450798151',
		'level': 75
	},
	{
		'role': '1182166525386432642',
		'level': 100
	},
	{
		'role': '1182169175779709008',
		'level': 600
	},
]
function levelUpCheck(xpObject,xpIndex,targetuser,client){
	let guild = client.guilds.cache.get('1089262275036201090');
	let targetmember = guild.members.cache.get(targetuser.id);
	let xpNeeded = 75
	let i = 0
	while(xpObject[xpIndex].xp > xpNeeded) {
		i++
		xpNeeded+=75+100*i
	}
	if(i == xpObject[xpIndex].level){
		return
	}
	xpObject[xpIndex].level=i
	let roleIndex = rolesLevels.findIndex(element => element.level === xpObject[xpIndex].level)
	let addedRolesString = ``
	for (let i = 0; i < rolesLevels.length; i++) {
		if (xpObject[xpIndex].level >= rolesLevels[i].level && !targetmember.roles.cache.has(rolesLevels[i].role)){
			targetmember.roles.add(rolesLevels[i].role)
			addedRolesString=addedRolesString.concat(` and earned the <@&${rolesLevels[i].role}> role`)
		}
	}
	client.channels.cache.get('1182165246870310984').send(`${targetuser} has reached level **${xpObject[xpIndex].level}**${addedRolesString}`)

}
module.exports = {
	data: new SlashCommandBuilder()
		.setName('xp')
		.setDescription('adds/removes xp from selected user, otherwise user who ran command if none specified')
		.addIntegerOption(option =>
			option.setName('type')
				.setDescription('add/remove')
				.setRequired(true)
				.addChoices(
					{ name: 'add', value: 1 },
					{ name: 'remove', value: -1 }
				))
		.addIntegerOption(option =>
			option.setName('amount')
				.setDescription('amount of xp to add')
				.setRequired(true))
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('user to add/remove xp from')),
	async execute(interaction, xpObject, client) {
		const targetuser = interaction.options.getUser('user') ?? interaction.user;
		const multiplier = interaction.options.getInteger('type')
		const amount = interaction.options.getInteger('amount')
		let xpIndex = xpObject.findIndex(element => element.id === targetuser.id)
		if(xpIndex == -1){
			let userxp = {
				id: targetuser.id,
				username: targetuser.username,
				xp: 0,
				level: 0,
				timeout: false
			}
			xpObject.push(userxp)
			xpIndex = xpObject.findIndex(element => element.id === targetuser.id)
		}
		xpObject[xpIndex].xp += amount*multiplier
		levelUpCheck(xpObject,xpIndex,targetuser,client)
		let jsonXP = JSON.stringify(xpObject) // turns js back into json
		fs.writeFileSync("xp.json", jsonXP) // the json file is now the xp variable
		await interaction.reply(`changed ${targetuser}'s xp by ${amount*multiplier}`)
	},
};