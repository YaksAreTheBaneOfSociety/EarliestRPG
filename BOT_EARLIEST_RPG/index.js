const { Client, Collection, Events, GatewayIntentBits, Discord } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});
const fs = require("fs")
const path = require("path")

let invData = fs.readFileSync("inventory.json") // reads the json file
let inventory = JSON.parse(invData) // turns json into js
let skillsData = fs.readFileSync("skills.json") // reads the json file
let skills = JSON.parse(skillsData) // turns json into js
let onCooldown = false
let cooldownTimer = 3 //in seconds

var randomProperty = function (obj) {
    var keys = Object.keys(obj);
    return keys[ keys.length * Math.random() << 0];
}

var randomElement = function (array) {
	return array[array.length * Math.random() << 0]
}

function save(m){
	let jsonInv = JSON.stringify(inventory) // turns js back into json
	fs.writeFileSync("inventory.json", jsonInv) // the json file is now the users variable
	let jsonSkills = JSON.stringify(skills) // turns js back into json
	fs.writeFileSync("skills.json", jsonSkills) // the json file is now the users variable
	m.channel.send(`**SAVED SUCCESSFULLY**`)
}

function catchFish(bait, catchTier, m, inventory, invIndex){
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
		}
	}
	let fishCaught = randomElement(fish[bait][catchTier])
	m.channel.send(`${m.author} caught one ${fishCaught}`)
	if(fishCaught in inventory[invIndex].fish){
		inventory[invIndex].fish[fishCaught]++
	}else{
		inventory[invIndex].fish[fishCaught] = 1
	}
	return(inventory[invIndex])
}

var levelUpCheck = function (skills,skillsIndex,skill,level,xp,m){
	if(level<500){
		xpNeeded=100+100*skills[skillsIndex][skill].level
		if(skills[skillsIndex][skill].xp>=xpNeeded){
			skills[skillsIndex][skill].xp-=xpNeeded
			skills[skillsIndex][skill].level++
			m.channel.send(`${m.author} leveled up ${skill} to **${skills[skillsIndex][skill].level}**`)
		}
	}
	return(skills[skillsIndex])
}

function coolDown(time){
	onCooldown = true;
    setTimeout(() => {
        onCooldown = false;
    }, time * 1000);
}


// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on("messageCreate", (m) => {
	let message = String(m)
	if(m.channel.id=='1186529778312941578'){
		if(onCooldown){
			return;
		}
		if(m.member.roles.cache.some(role => role.name === 'earliest tester')){
			try{
	//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA

				let invIndex = inventory.findIndex(element => element.id === m.author.id)
				if (invIndex == -1){
					let userObject = {
						id: m.author.id,
						bait: {worms: 0, leeches: 0, grubs: 0, minnows: 0, bread: 0},
						fish: {}
					}
					inventory.push(userObject)
					let jsonInv = JSON.stringify(inventory) // turns js back into json
					fs.writeFileSync("inventory.json", jsonInv) // the json file is now the users variable
				}
				invIndex = inventory.findIndex(element => element.id === m.author.id)
				let skillsIndex = skills.findIndex(element => element.id === m.author.id)
				if (skillsIndex == -1){
					let userObject = {
						id: m.author.id,
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
					let jsonSkills = JSON.stringify(skills) // turns js back into json
					fs.writeFileSync("skills.json", jsonSkills) // the json file is now the users variable
				}
				skillsIndex = skills.findIndex(element => element.id === m.author.id)

				for (const [key, value] of Object.entries(skills[skillsIndex])) {
					if(key != 'id'){
						skills[skillsIndex] = levelUpCheck(skills,skillsIndex,key,value.level,value.xp,m)
					}
				}
			
				//	console.log(`${randomProperty(inventory[invIndex].bait)}`)
	/*				
					if (message.startsWith("!test")){
						message = message.slice(6);
						if(message=='test'){
							console.log(`m: ${m}, message: ${message}`);
						}else{
							m.channel.send(`${m.author} USED TEST WRONG. LOSER.`)
						}
					}
	*/
				if (message.startsWith("!save")){
					save(m)
				}
				
				if (message.startsWith("!skills")){
					for (const [key, value] of Object.entries(skills[skillsIndex])) {
						if(key != 'id'){
							m.channel.send(`${m.author}'s ${key} skill is **${value.level}**. current ${key} xp is **${value.xp}**`)
						}
					}
				}
				if (message.startsWith("!inventory")){
					message = message.slice(11)
					if(message == ''){
						m.channel.send(`${m.author} USED INVENTORY WRONG. LOSER.`)
						return;
					}
					if(!(message in inventory[invIndex])){
						m.channel.send(`${m.author} has no items of type: ${message}`)
						return;
					}
					let isEmpty=false
					for (const [key, value] of Object.entries(inventory[invIndex][message])) {
						if(value != 0){
							m.channel.send(`${m.author} has ${value} ${key}`)
							isEmpty=true
						}
					}
					if(isEmpty==false){
						m.channel.send(`${m.author} has no items of type: ${message}`)
					}
				}

				if (message.startsWith("!fish")){
					if(!('fish' in inventory[invIndex])){
						inventory[invIndex].fish={}
					}
					message = message.slice(6);
					if(inventory[invIndex].bait[message]==0){
						m.channel.send(`${m.author} has no ${message}`)
						return;
					}
					if(!(message in inventory[invIndex].bait)){
						m.channel.send(`${m.author} USED FISH WRONG. LOSER.`)
						return;
					}
					inventory[invIndex].bait[message]--
					let catchChance = skills[skillsIndex].fishing.level/50
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
					skills[skillsIndex].fishing.xp+=xpEarned
					m.channel.send(`${m.author} earned ${xpEarned} fishing xp`)
					if(catchType==''){
						m.channel.send(`${m.author} didn't catch shit`)
						return;
					}
					inventory[invIndex] = catchFish(message, catchType, m, inventory, invIndex)
				}

				if (message.startsWith("!forage")){
					message = message.slice(8);
					if(message=='bait'){
						let itemToForage = randomProperty(inventory[invIndex].bait)
						inventory[invIndex].bait[itemToForage]++
						m.channel.send(`${m.author} has foraged and found ${itemToForage}. They now have ${inventory[invIndex].bait[itemToForage]}.`)
					}else if(message==''){
						m.channel.send(`Must enter a valid foraging category. Available categories: bait`)
					}else{
						m.channel.send(`"${message}" is not a valid foraging category. Available categories: bait`)
					}
				}

				for (const [key, value] of Object.entries(skills[skillsIndex])) {
					if(key != 'id'){
						skills[skillsIndex] = levelUpCheck(skills,skillsIndex,key,value.level,value.xp)
					}
				}	

			}finally{
				if(String(m).startsWith("!")){
					coolDown(cooldownTimer)
				}
			}
	//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
		}else{
			m.reply(`${m.author} is not authorized.`)
		}
	}
})
// Log in to Discord with your client's token
client.login(token);