const { Client, Collection, Events, GatewayIntentBits, Discord } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers
	],
});
const fs = require("fs")
const path = require("path")

let xpData = fs.readFileSync("xp.json") // reads the json file
let xpObject = JSON.parse(xpData) // turns json into js

const xpMin = 15
const xpMax = 40
const xpMultiplierForNotRobot = 2

function levelUpCheck(xpObject,xpIndex,m){
	xpNeeded=75+100*xpObject[xpIndex].level
	if(xpObject[xpIndex].xp>=xpNeeded){
		xpObject[xpIndex].xp=0
		xpObject[xpIndex].level++
		client.channels.cache.get('1182165246870310984').send(`${m.author} has reached level **${xpObject[xpIndex].level}**`)
	}
}

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on("messageCreate", (m) => {
	let xpIndex = xpObject.findIndex(element => element.id === m.author.id)
	if(xpIndex == -1){
		let userxp = {
			id: m.author.id,
			xp: 0,
			level: 0,
			timeout: false
		}
		xpObject.push(userxp)
		xpIndex = xpObject.findIndex(element => element.id === m.author.id)
	}
	if(xpObject[xpIndex].timeout == false){
		let xpToAdd = Math.floor(Math.random()*(xpMax-xpMin+1))+xpMin
		xpObject[xpIndex].xp += xpToAdd
		levelUpCheck(xpObject,xpIndex,m)
		xpObject[xpIndex].timeout=true
		setTimeout(() => {
			xpObject[xpIndex].timeout=false
		}, 60000);
		let jsonXP = JSON.stringify(xpObject) // turns js back into json
		fs.writeFileSync("xp.json", jsonXP) // the json file is now the xp variable
	}	
})
// Log in to Discord with your client's token
client.login(token);