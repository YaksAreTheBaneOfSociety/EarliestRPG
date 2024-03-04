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

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction, xpObject, client);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

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
			username: "test",
			xp: 0,
			level: 0,
			timeout: false
		}
		xpObject.push(userxp)
		xpIndex = xpObject.findIndex(element => element.id === m.author.id)
	}
	try{
		if(xpObject[xpIndex].username != m.member.displayName){
			xpObject[xpIndex].username = m.member.displayName
		}
	}catch{
		xpObject[xpIndex].username = m.author.username
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