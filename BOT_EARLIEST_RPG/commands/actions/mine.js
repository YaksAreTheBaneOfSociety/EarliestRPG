const { SlashCommandBuilder,  Client, Collection, Events, GatewayIntentBits, Discord  } = require('discord.js');
const fs = require("fs")
const path = require("path")
module.exports = {
	data: new SlashCommandBuilder()
		.setName('mine')
		.setDescription('interactions for the mine')
        .addSubcommand(subcommand =>
            subcommand
                .setName("mine")
                .setDescription('mine for ore'))
        .addSubcommand(subcommand =>
            subcommand
                .setName("descend")
                .setDescription('descend a level'))
        .addSubcommand(subcommand =>
            subcommand
                .setName("fight")
                .setDescription('fight enemies')),
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
                    ore: {"ore pouch": 10},
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
                    },
                    mining: {
                        level: 1,
                        xp: 0
                    }
                },
                locationsActions: {
                    location: '',
                    action: '',
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
        function sumValues(obj) {
            return Object.values(obj).reduce((sum, value) => sum + value, 0);
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
        if(playerSave.locationsActions.action != ''){
            interaction.reply("You grow an extra set of hands? Finish what you're doing before starting another action.")
            return
        }
        if(playerSave.locationsActions.mine == null){
            interaction.reply(`You cannot mine at the ${playerSave.locationsActions.location}. Try going to the *abandoned general mine*.`)
            return
        }

        if(interaction.options.getSubcommand() === "mine"){
            
            const ores = {
                "stone": {"max": "inventory", "rarity": 1, "levels": [1, 500], "xp": 1},
                "coal": {"max": "inventory", "rarity": 0.1, "levels": [1, 100], "xp": 5},
                "iron ire": {"max": "inventory", "rarity": 0.06, "levels": [20, 200], "xp": 10},
                "copper ore": {"max": "inventory", "rarity": 0.05, "levels": [1, 150], "xp": 12},
                "tin ore": {"max": "inventory", "rarity": 0.05, "levels": [1, 150], "xp": 12},
                "lead ore": {"max": "inventory", "rarity": 0.03, "levels": [30, 200], "xp": 20},
                "zinc ore": {"max": "inventory", "rarity": 0.03, "levels": [40, 220], "xp": 20},
                "silver ore": {"max": "inventory", "rarity": 0.02, "levels": [50, 250], "xp": 25},
                "nickel ore": {"max": "inventory", "rarity": 0.02, "levels": [50, 250], "xp": 25},
                "gold ore": {"max": "inventory", "rarity": 0.01, "levels": [100, 300], "xp": 50},
                "platinum ore": {"max": "inventory", "rarity": 0.008, "levels": [150, 350], "xp": 75},
                "rough amethyst": {"max": "inventory", "rarity": 0.008, "levels": [50, 300], "xp": 75},
                "cobalt ore": {"max": "inventory", "rarity": 0.007, "levels": [100, 400], "xp": 80},
                "titanium ore": {"max": "inventory", "rarity": 0.006, "levels": [200, 400], "xp": 85},
                "rough emerald": {"max": "inventory", "rarity": 0.005, "levels": [200, 450], "xp": 90},
                "rough ruby": {"max": "inventory", "rarity": 0.005, "levels": [150, 400], "xp": 90},
                "rough sapphire": {"max": "inventory", "rarity": 0.005, "levels": [100, 350], "xp": 90},
                "uranium ore": {"max": "inventory", "rarity": 0.004, "levels": [300, 500], "xp": 95},
                "rough diamond": {"max": "inventory", "rarity": 0.003, "levels": [250, 500], "xp": 100},
                "Ancient General Shard": {"max": 1, "rarity": 0.001, "levels": [10,500], "messageSucceded":`You found what seems to be a shard of General. Legends tell of an evil monster that ruled these mines long ago in search of them. You should try to get it appraised by an expert.`, "messageFailed": `You have found another Ancient General Shard. Bringing it close to your other shard it becomes extremely hot, too much so to handle. You decide to leave it behind as to not burn up all of your equipment.`, "xp": 200}
            };
            if(playerSave.locationsActions.mine.oreRemaining == 0){
                interaction.reply(`There is nothing left to mine on this level.`)
                return
            }
            if(playerSave.locationsActions.mine.enemies[0] != null){
                interaction.reply(`There are still enemies on this level.`)
                return
            }
            interaction.reply(`${interactionUser} has started mining`)
            playerSave.locationsActions.action='mining'
            if(!('ore' in playerSave.inventory)){
                playerSave.inventory.ore={"ore pouch": 10}
            }
            if(!('mining' in playerSave.skills)){
                playerSave.skills.mining={"level": 1,"xp":0}
            }
            save(interaction)
            let i = playerSave.locationsActions.mine.oreRemaining
            let xpRounder = 0
            let totalXP = 0
            function loopTilNoOre() {         //  create a loop function
                setTimeout(function() {   //  call a 3s setTimeout when the loop is called
                    let saveData = fs.readFileSync("saves/save-"+targetUser.id+".json") // reads the json file
                    playerSave = JSON.parse(saveData) // turns json into js
                    let xpEarned = 0
                    let itemMined = ""

                    for (const [key, value] of Object.entries(ores)) {
                        if(Math.random() < value.rarity && playerSave.locationsActions.mine.level >= value.levels[0] && playerSave.locationsActions.mine.level <= value.levels[1]){
                            itemMined = key
                        }
                    }
                    if(itemMined == ""){
                        itemMined = "Stone"
                    }
                    xpEarned+=ores[itemMined].xp
                    if(sumValues(playerSave.inventory.ore) >= 2*playerSave.inventory.ore["ore pouch"]){//multiply ore pouch by 2 since ore pouch itself is counted as an ore item
                        playerSave.locationsActions.action = ''
                        interaction.channel.send(`${interactionUser.username}'s ore pouch is full.`)
                    }else{
                        if(ores[itemMined].max != "inventory"){
                            if(itemMined in playerSave.inventory.ore){
                                if(playerSave.inventory.ore[itemMined]>=ores[itemMined].max){
                                    interaction.channel.send(`<@${interactionUser.id}> ` + ores[itemMined].messageFailed)
                                }else{
                                    playerSave.inventory.ore[itemMined]++
                                    interaction.channel.send(`<@${interactionUser.id}> ` + ores[itemMined].messageSucceded)

                                }
                            }else{
                                playerSave.inventory.ore[itemMined] = 1
                                interaction.channel.send(`<@${interactionUser.id}> ` + ores[itemMined].messageSucceded)
                            }
                        }else{
                            if(itemMined in playerSave.inventory.ore){
                                playerSave.inventory.ore[itemMined]++
                            }else{
                                playerSave.inventory.ore[itemMined] = 1
                            }
                            interaction.channel.send(`${interactionUser.username} mined one ${itemMined}`)
                        }
                    }
                    i--
                    playerSave.locationsActions.mine.oreRemaining--
                    totalXP+=xpEarned
                    playerSave.skills.mining.xp+=xpEarned
                    playerSave.skills = levelUpCheck('mining',interaction,interactionUser)
                    save(interaction)
                    if (i > 0 && playerSave.locationsActions.action == 'mining') {           //  if the counter < 10, call the loop function
                        loopTilNoOre();             //  ..  again which will trigger another 
                    }else{
                        playerSave.locationsActions.action = ''
                        save(interaction)
                        interaction.channel.send(`<@${interactionUser.id}> has stopped mining. Total XP earned: **${totalXP}**.`)
                    }                       //  ..  setTimeout()
                }, 5500-(playerSave.skills.mining.level*10))
            }
            loopTilNoOre();                   //  start the loop
        }else if(interaction.options.getSubcommand() === "descend"){
            if(playerSave.locationsActions.mine.level == 10){
                interaction.reply(`The deeper levels to the mine appear to be blocked off by a sign saying: "Come back when there is a working combat system." Utterly confused at this blatant 4th wall breaking, you black out and awaken at the entrance to the mine.`)
                playerSave.locationsActions.mine = {level:0,enemies:{},oreRemaining:0}
                save(interaction)
                return
            }else{
                //everything here will be the entirety of the subcommand when combat is added
                if(playerSave.locationsActions.mine.enemies[0] != null){
                    interaction.reply(`You cannot descend while enemies remain on this level.`)
                    return
                }
                if(playerSave.locationsActions.mine.level == 500){
                    interaction.reply(`You have reached the bottom of the mine.`)
                    return
                }
                playerSave.locationsActions.mine.level++
                playerSave.locationsActions.mine.oreRemaining = Math.ceil(((playerSave.locationsActions.mine.level)/20)+(25*Math.random()))
                //playerSave.locationsActions.mine.enemies = {}
                //playerSave.locationsActions.mine.enemies+={name:"goblin",health:20,attack:5}//eventually pull enemy object from a list, just general template here
                interaction.reply(`You have descended to level ${playerSave.locationsActions.mine.level} in the mine.`)
                save(interaction)
            }

        }else if(interaction.options.getSubcommand() === "fight"){
            interaction.reply(`insert really cool fighting enemies system here`)
        }
	},
};