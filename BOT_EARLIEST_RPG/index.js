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
var cron = require('node-cron');

client.commands = new Collection();
client.cooldowns = new Collection();
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

	const { cooldowns } = interaction.client;

	if (!cooldowns.has(command.data.name)) {
		cooldowns.set(command.data.name, new Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.data.name);
	const defaultCooldownDuration = 3;
	const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;

	if (timestamps.has(interaction.user.id)) {
		const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

		if (now < expirationTime) {
			const expiredTimestamp = Math.round(expirationTime / 1_000);
			return interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, ephemeral: true });
		}
	}
	timestamps.set(interaction.user.id, now);
	setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

	try {
		await command.execute(interaction, client);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

let saveData = fs.readFileSync("save.json") // reads the json file
let inventory = JSON.parse(saveData)[0] // turns json into js
let skills = JSON.parse(saveData)[1] // turns json into js
let locationsActions = JSON.parse(saveData)[2] // turns json into js

var randomProperty = function (obj) {
    var keys = Object.keys(obj);
    return keys[ keys.length * Math.random() << 0];
}

function save(m,inventory,skills,locationsActions){
	let jsonSave = JSON.stringify(inventory,skills,locationsActions) // turns js back into json
	fs.writeFileSync("save.json", jsonSave) // the json file is now the users variable
	m.channel.send(`**SAVED SUCCESSFULLY**`)
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



// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on("messageCreate", (m) => {
	let message = String(m)
	if(m.channel.id=='1186529778312941578'){
		if(m.member.roles.cache.some(role => role.name === 'earliest tester')){
			return
		}else{
			m.reply(`${m.author} is not authorized.`)
		}
	}
})
// Log in to Discord with your client's token
client.login(token);