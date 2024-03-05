const { SlashCommandBuilder,  Client, Collection, Events, GatewayIntentBits, Discord  } = require('discord.js');
const fs = require("fs")
const path = require("path")
module.exports = {
	data: new SlashCommandBuilder()
		.setName('secretword')
		.setDescription('Replies with daily secret word info'),
	async execute(interaction, xpObject, client) {
		let randomWordData = fs.readFileSync("wordOfTheDay.json") // reads the json file
		let randomWord = JSON.parse(randomWordData) // turns json into js
		let half1 = ""
		let half2 = ""
		if(randomWord[1].found == false){
			half1 = (`Yesterday's secret word was **${randomWord[1].word}**. It was **NOT** found.`)
		}else{
			half1 = (`Yesterday's secret word was **${randomWord[1].word}**. It was found by ${randomWord[1].foundBy}.`)
		}
		if(randomWord[0].found == false){
			half2 = (`Today's secret word has been used **${randomWord[0].count}** times before March 4, 2024. Today's random word has **NOT** been found`)
		}else{
			half2 = (`Today's secret word has been found by ${randomWord[0].foundBy}. Today's random word was **${randomWord[0].word}**.`)
		}
		await interaction.reply(half1.concat("\n", half2))
	},
};