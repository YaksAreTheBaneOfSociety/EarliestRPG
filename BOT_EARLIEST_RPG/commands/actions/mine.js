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
                .setName("heal")
                .setDescription('Use a healing item')
                .addStringOption(option =>
                    option.setName('item')
                        .setDescription('healing item to use')
                        .setRequired(true)
                        .addChoices(
                            { name: 'tiny health potion', value: 'tiny health potion' },
                            { name: 'small health potion', value: 'small health potion' },
                            { name: 'medium health potion', value: 'medium health potion' },
                            { name: 'large health potion', value: 'large health potion' },
                            { name: 'giant health potion', value: 'giant health potion' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName("fight")
                .setDescription('fight enemies')
                .addStringOption(option =>
                    option.setName('enemy')
                        .setDescription('Enemy to attack (defaults to first)'))
                .addStringOption(option =>
                    option.setName('weapon')
                        .setDescription('weapon to attack with (defaults to highest damage)'))),
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
        function rollDice(input) {
            if (typeof input === 'string') {
                const dicePattern = /(\d+)d(\d+)([+-]\d+)?/;
                const match = input.match(dicePattern);
        
                if (match) {
                    const numDice = parseInt(match[1], 10);
                    const numSides = parseInt(match[2], 10);
                    const modifier = match[3] ? parseInt(match[3], 10) : 0;
        
                    let total = 0;
                    for (let i = 0; i < numDice; i++) {
                        total += Math.floor(Math.random() * numSides) + 1;
                    }
        
                    total += modifier;
                    return total;
                } else {
                    throw new Error('Invalid dice string format');
                }
            } else if (typeof input === 'number') {
                return input;
            } else {
                throw new Error('Invalid input');
            }
        }
        function getAverageDiceValue(diceString) {
            const dicePattern = /(\d+)d(\d+)([+-]\d+)?/;
            const match = diceString.match(dicePattern);
        
            if (match) {
                const numDice = parseInt(match[1], 10);
                const numSides = parseInt(match[2], 10);
                const modifier = match[3] ? parseInt(match[3], 10) : 0;
        
                // Average value of a single die is (numSides + 1) / 2
                const averageDieValue = (numSides + 1) / 2;
        
                // Average value for all dice plus the modifier
                const averageValue = numDice * averageDieValue + modifier;
                return averageValue;
            } else {
                throw new Error('Invalid dice string format');
            }
        }
        
        function getMaxValueKey(obj) {
            let maxVal = 0;
            let maxKey = null;
        
            for (const [key, item] of Object.entries(obj)) {
                let value;
                if (typeof item.damage === 'string' && item.damage.includes('d')) {
                    value = getAverageDiceValue(item.damage);
                } else if (typeof item.damage === 'number') {
                    value = item.damage;
                }
                if (value > maxVal) {
                    maxVal = value;
                    maxKey = key;
                }
            }
        
            return maxKey;
        }
        function addItemToInventory(item, interaction){
            if(typeof item.value === 'number'){
                interaction.channel.send(`${interaction.user.username} picked up ${item.value} ${item.name}`)
                if(item.name in playerSave.inventory[item.type]){
                    playerSave.inventory[item.type][item.name]+= 1+Math.random()*item.value
                }else{
                    playerSave.inventory[item.type][item.name] = 1+Math.random()*item.value
                }
            }else{
                if(item.name in playerSave.inventory[item.type]){
                    return
                }else{
                    playerSave.inventory[item.type][item.name] = item.value
                    interaction.channel.send(`${interaction.user.username} picked up a ${item.name}`)
                }
            }
        }

        function floorPopulator(floor, playerLevel, enemies, levelType) {
            const targetPoints = floor * playerLevel;
            const eligibleEnemies = enemies.filter(enemy => enemy.levels[0] <= floor && enemy.levels[1] >= floor);
            const minibosses = eligibleEnemies.filter(enemy => enemy.name.startsWith("Miniboss"));
            const bosses = eligibleEnemies.filter(enemy => enemy.name.startsWith("Boss"));
            const normalEnemies = eligibleEnemies.filter(enemy => !enemy.name.startsWith("Miniboss") && !enemy.name.startsWith("Boss"));
        
            const result = [];
            const nameCount = {};
            let currentPoints = 0;
        
            function weightedRandomSelect(array) {
                const totalPoints = array.reduce((sum, item) => sum + item.points, 0);
                const randomValue = Math.random() * totalPoints;
                let accumulatedPoints = 0;
        
                for (let item of array) {
                    accumulatedPoints += item.points;
                    if (randomValue <= accumulatedPoints) {
                        return item;
                    }
                }
                return null;
            }
        
            function addEnemyToResult(enemy) {
                if (currentPoints + enemy.points <= targetPoints && result.length < 10) {
                    const randomWeaponIndex = Math.floor(Math.random() * enemy.weapons.length);
                    const selectedWeapon = enemy.weapons[randomWeaponIndex];
                    const enemyName = nameCount[enemy.name] ? `${enemy.name} ${nameCount[enemy.name]}` : enemy.name;
                    let addedDrops = [];
                    if(enemy.drops.length > 0) {
                        const randomDropIndex = Math.floor(Math.random() * enemy.drops.length);
                        const drop = enemy.drops[randomDropIndex];
                        if (Math.random() < drop.chance) {
                            addedDrops.push({
                                name: drop.name,
                                type: drop.type,
                                value: drop.value
                            });
                        }
                    }
                    result.push({
                        name: enemyName,
                        health: enemy.health,
                        weapon: selectedWeapon,
                        xp: enemy.xp,
                        coins: 1 + Math.floor(enemy.coins * Math.random()),
                        points: enemy.points,
                        levels: enemy.levels,
                        drops: addedDrops
                    });
        
                    nameCount[enemy.name] = (nameCount[enemy.name] || 0) + 1;
                    currentPoints += enemy.points;
                }
            }
        
            if (levelType === "miniboss" && minibosses.length > 0) {
                const selectedMiniboss = weightedRandomSelect(minibosses);
                addEnemyToResult(selectedMiniboss);
            } else if (levelType === "boss" && bosses.length > 0) {
                const selectedBoss = weightedRandomSelect(bosses);
                addEnemyToResult(selectedBoss);
        
                while (currentPoints < targetPoints && normalEnemies.length > 0 && result.length < 10) {
                    const selectedEnemy = weightedRandomSelect(normalEnemies);
                    addEnemyToResult(selectedEnemy);
                }
            } else {
                while (currentPoints < targetPoints && normalEnemies.length > 0 && result.length < 10) {
                    const selectedEnemy = weightedRandomSelect(normalEnemies);
                    addEnemyToResult(selectedEnemy);
                }
            }
        
            return result;
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
        const enemiesList =[
            {name: "Cave Goblin", health: 5, weapons: [{name: "Goblin Spear", damage: "1d2"}, {name: "Goblin Sword", damage: 2}], xp: 10, coins: 10, drops: [{name: "Goblin's Spear", type: "combat", value: {damage:"1d2",price:10}, chance:0.1},{name: "Goblin's Sword", type: "combat", value: {price: 10, damage:2}, chance:0.08}], points : 1, levels: [1, 10]},
            {name: "Rock Beetle", health: 7, weapons: [{name: "Mandibles", damage: "1d3"}], xp: 12, coins: 8, drops: [{name: "stone", type: "ore", value: 1, chance: 0.1}], points : 2, levels: [1, 20]},
            {name: "Mine Spider", health: 6, weapons: [{name: "Venomous Bite", damage: "1d4"}], xp: 14, coins: 9, drops: [], points : 2, levels: [1, 50]},
            {name: "Cave Bat", health: 1, weapons: [{name: "Sharp Fangs", damage: "1d2"}], xp: 8, coins: 5, drops: [], points : 1, levels: [1, 100]},
            {name: "Stone Golem", health: 100, weapons: [{name: "Stone Fist", damage: "1d5"}], xp: 18, coins: 15, drops: [{name: "stone", type: "ore", value: 50, chance: 0.1}], points : 50, levels: [1, 100]},
            {name: "Mushroom Man", health: 20, weapons: [{name: "Spore Cloud", damage: "1d2"}, {name: "Fungal Punch", damage: "1d3"}], xp: 10, coins: 8, drops: [], points : 5, levels: [1, 100]},
            {name: "Cave Worm", health: 10, weapons: [{name: "Bite", damage: "1d3"}], xp: 9, coins: 7, drops: [], points : 3, levels: [5, 25]},
            {name: "Quartz Elemental", health: 90, weapons: [{name: "Crystal Spike", damage: "1d4"}], xp: 20, coins: 18, drops: [{name: "rough amethyst", type: "ore", value: 1, chance: 0.1}], points : 36, levels: [50, 125]},
            {name: "Green Slime", health: 20, weapons: [{name: "Acidic Touch", damage: "1d3"}], xp: 12, coins: 10, drops: [], points : 6, levels: [1, 100]},     
            {name: "Cave Serpent", health: 80, weapons: [{name: "Venomous Bite", damage: "2d3"}], xp: 18, coins: 20, drops: [], points : 48, levels: [25, 150]},
            {name: "Crystal Crab", health: 120, weapons: [{name: "Claw Pinch", damage: "1d4+1"}], xp: 25, coins: 25, drops: [{name: "rough amethyst", type: "ore", value: 1, chance: 0.1}], points : 60, levels: [10, 200]},
            {name: "Iron Golem", health: 200, weapons: [{name: "Iron Fist", damage: "2d5"}], xp: 30, coins: 30, drops: [{name: "iron ore", type: "ore", value: 25, chance: 0.1}], points : 200, levels: [100, 250]},
            {name: "Cave Ogre", health: 200, weapons: [{name: "Great Club", damage: "3d3+1"}], xp: 40, coins: 35, drops: [{name: "Ogre's Great Club", type: "combat", value: {price: 10, damage:"3d3+1"}, chance:0.05}], points : 200, levels: [100, 200]},
            {name: "Chasm Drake", health: 180, weapons: [{name: "Fiery Breath", damage: "3d4"}, {name: "Claw Swipe", damage: "2d3"}], xp: 35, coins: 30, drops: [], points : 210, levels: [100, 500]},
            {name: "Lava Slime", health: 90, weapons: [{name: "Molten Touch", damage: "1d4+4"}], xp: 20, coins: 15, drops: [], points : 72, levels: [100, 175]},
            {name: "Shadow Dweller", health: 110, weapons: [{name: "Shadow Blade", damage: "2d3"}, {name: "Dark Dagger", damage: "1d4"}], xp: 27, coins: 22, drops: [{name: "Shadow Dweller's Blade", type: "combat", value: {price: 10, damage:"2d3"}, chance:0.04},{name: "Shadow Dweller's Dagger", type: "combat", value: {price: 10, damage:"1d4"}, chance:0.08}], points : 55, levels: [50, 500]},
            {name: "Echo Bat", health: 10, weapons: [{name: "Sonic Screech", damage: "1d4"}], xp: 15, coins: 10, drops: [], points : 4, levels: [100, 200]},
            {name: "W Imp", health: 10, weapons: [{name: "Whine", damage: "1d2"}, {name: "Cower", damage: 1}], xp: 5, coins: 2, drops: [], points : 5, levels: [1, 10]},
            {name: "Skeleton", health: 10, weapons: [{name: "Stare Into The Distance", damage: 0}], xp: 5, coins: 2, drops: [], points : 5, levels: [1, 10]},
            {name: "Bi-Blanket", health: 10, weapons: [{name: "Confuse", damage: 1}, {name: "Tangle", damage: "1d2"}], xp: 5, coins: 2, drops: [], points : 5, levels: [1, 10]},
            {name: "Two-Headed Rat", health: 10, weapons: [{name: "Bite", damage: "1d2"}, {name: "Double Bite", damage: "2d2"}, {name: "Triple Bite", damage: "3d2"}], xp: 5, coins: 2, drops: [], points : 5, levels: [1, 10]},
            {name: "Miniboss Spicy Espresso Bean", health: 50, weapons: [{name: "Bowel Poison", damage: "6d2"}, {name: "Bean Bag Gun", damage: "5d3"}], xp: 45, coins: 25, drops: [], points : 10, levels: [10, 10]},
            {name: "Miniboss Galgarothnikosh", health: 10, weapons: [{name: "FIRE OF THE OVERLORDS", damage: "1d3"}, {name: "RAIN OF BRIMSTONE", damage: "6d2"}], xp: 5, coins: 2, drops: [{name: "Galgarothnikosh's Megaphone", type: "combat", value: {price: 100, damage:"1d3"}, chance:1}], points : 10, levels: [10, 10]},
            {name: "Miniboss Stone Brute", health: 300, weapons: [{name: "Earthshatter Hammer", damage: "3d6"}, {name: "Rockfall", damage: "4d4"}], xp: 80, coins: 50, drops: [{name: "Stone Brute's Greathammer", type: "combat", value: {price: 1000, damage:"3d6"}, chance:0.05},{name: "stone", type: "ore", value: 100, chance: 0.1}], points : 500, levels: [100, 300]},
            {name: "Miniboss Crystal Warlord", health: 350, weapons: [{name: "Gemblade", damage: "4d4+3"}, {name: "Crystalline Shield Bash", damage: "3d6"}], xp: 100, coins: 60, drops: [{name: "Crystal Warlord's Gemblade", type: "combat", value: {price: 1000, damage:"4d4+3"}, chance:0.025},{name: "rough amethyst", type: "ore", value: 10, chance: 0.1}], points : 650, levels: [150, 400]},
            {name: "Miniboss Flame Brute", health: 370, weapons: [{name: "Inferno Axe", damage: "3d5"}, {name: "Fire Punch", damage: "2d6"}], xp: 115, coins: 65, drops: [{name: "Flame Brute's Inferno Axe", type: "combat", value: {price: 1000, damage:"3d5"}, chance:0.01}], points : 480, levels: [100, 400]},
            {name: "Miniboss Shadow Dweller Assassin", health: 330, weapons: [{name: "Dagger of Darkness", damage: "3d4+1"}, {name: "Silent Strike", damage: "2d5"}], xp: 95, coins: 55, drops: [{name: "Shadow Dweller's Assassin Dagger", type: "combat", value: {price: 1000, damage:"3d4+1"}, chance:0.01}], points : 420, levels: [50, 500]},
            {name: "Miniboss Mine Guardian", health: 360, weapons: [{name: "Granite Smash", damage: "3d6"}, {name: "Stone Shield Bash", damage: "2d4+2"}], xp: 105, coins: 60, drops: [{name: "stone", type: "ore", value: 100, chance: 0.1}], points : 650, levels: [250, 500]},
            {name: "Boss Lava Serpent", health: 620, weapons: [{name: "Volcanic Fang", damage: "5d5"}, {name: "Lava Surge", damage: "4d6"}], xp: 210, coins: 110, drops: [], points : 1050, levels: [400, 500]},
            {name: "Boss Shadow Dweller Overlord", health: 580, weapons: [{name: "Eclipse Blade", damage: "4d6+3"}, {name: "Dark Nova", damage: "3d5"}], xp: 190, coins: 95, drops: [{name: "Shadow Overlord's Blade", type: "combat", value: {price: 6000, damage:"4d6+3"}, chance:0.01}], points : 1000, levels: [50, 500]},
            {name: "Boss Abyssal Titan", health: 600, weapons: [{name: "Abyssal Glaive", damage: "5d4+4"}, {name: "Void Slam", damage: "4d4+2"}], xp: 200, coins: 100, drops: [{name: "Abyssal Titan's Glaive", type: "combat", value: {price: 6500, damage:"5d4+4"}, chance:0.01}], points : 1050, levels: [400, 500]},
            {name: "Boss Stone Behemoth", health: 800, weapons: [{name: "Apocalyptic Maul", damage: "6d6"}, {name: "Tectonic Blast", damage: "5d6"}], xp: 500, coins: 200, drops: [{name: "Behemoth's Maul", type: "combat", value: {price: 6000, damage:"6d6"}, chance:0.01},{name: "stone", type: "ore", value: 200, chance: 0.1}], points : 1500, levels: [450, 500]},
            {name: "Boss Void Tyrant", health: 750, weapons: [{name: "Voidrender Sword", damage: "5d6+4"}, {name: "Cosmic Annihilation", damage: "4d6+3"}], xp: 480, coins: 180, drops: [{name: "Void Sword", type: "combat", value: {price: 6000, damage:"5d6+4"}, chance:0.01}], points : 2500, levels: [450, 500]},
            {name: "Boss Infernal Dragonlord", health: 1000, weapons: [{name: "Inferno Breath", damage: "6d5"}, {name: "Dragonclaw Swipe", damage: "5d4+2"}], xp: 490, coins: 190, drops: [{name: "Dragon's Claw", type: "combat", value: {price: 7500, damage:"5d4"}, chance:0.02}], points : 3000, levels: [450, 500]},
            {name: "Boss Eternal Guardian", health: 1400, weapons: [{name: "Celestial Spear", damage: "5d6+3"}, {name: "Stellar Barrage", damage: "4d5+2"}], xp: 460, coins: 185, drops: [{name: "Guardian's Celestial Spear", type: "combat", value: {price: 8000, damage:"5d6+3"}, chance:0.01}], points : 4500, levels: [450, 500]},
            {name: "Boss Abyssal Overlord", health: 1800, weapons: [{name: "Abyssal Greatsword", damage: "6d10"}, {name: "Oblivion Wave", damage: "2d20+10"}], xp: 500, coins: 200, drops: [{name: "Abyssal Lord's Greatsword", type: "combat", value: {price: 10000, damage:"6d10"}, chance:0.005}], points : 10000, levels: [450, 500]}
        
        ]
        let interactionUser = interaction.user
        if(playerSave.locationsActions.action != ''){
            interaction.reply("You grow an extra set of hands? Finish what you're doing before starting another action.")
            return
        }
        if(playerSave.locationsActions.mine == null){
            interaction.reply(`You cannot mine at the ${playerSave.locationsActions.location}. Try going to the *abandoned general mine*.`)
            return
        }
        if(!('combat' in playerSave.inventory)){
            playerSave.inventory.combat={"stick sorta shaped like a sword": {damage:1}}
        }
        if(!('consumables' in playerSave.inventory)){
            playerSave.inventory.consumables={
                "tiny health potion": 1,
                "small health potion": 0,
                "medium health potion": 0,
                "large health potion": 0,
                "giant health potion": 0
            }
        }
        if(!('combat' in playerSave.skills)){
            playerSave.skills.combat={"level": 1,"xp":0}
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
            if(playerSave.locationsActions.mine.health == "start"){
                playerSave.locationsActions.mine.health = 10+playerSave.skills.combat.level
            }
            let levelType="normal"
            if(playerSave.locationsActions.mine.level%50==0){
                levelType="boss"
                interaction.channel.send("**BOSS FIGHT**")
            }else if(playerSave.locationsActions.mine.level%10==0 && Math.random() < 0.1){
                levelType="miniboss"
                interaction.channel.send("**MINIBOSS FIGHT**")
            }
            
            playerSave.locationsActions.mine.enemies = floorPopulator(playerSave.locationsActions.mine.level, playerSave.skills.combat.level, enemiesList, levelType)
            let remainingEnemiesString = ``
            for (const [key, item] of Object.entries(playerSave.locationsActions.mine.enemies)) {
                remainingEnemiesString+=(`\n${item.name}: Health: ${item.health}`)
            }
            interaction.reply(`You have descended to level ${playerSave.locationsActions.mine.level} in the mine.\nEnemies on this level:${remainingEnemiesString}`)
            save(interaction)

        }else if(interaction.options.getSubcommand() === "fight"){
            if(playerSave.locationsActions.mine.enemies.length == 0){
                interaction.reply("There are no enemies left on this level")
                return
            }
            replyMessage = `Remaining enemies on this level:`
            let chosenWeapon = interaction.options.getString('Weapon') ?? null
            let chosenEnemy = playerSave.locationsActions.mine.enemies.findIndex(element => element.item === interaction.options.getString('Enemy')) ?? 0
            if(chosenEnemy == -1){
                chosenEnemy = 0
            }
            if(chosenWeapon == null){
                chosenWeapon = getMaxValueKey(playerSave.inventory.combat)
            }
            const damageDealt = rollDice(playerSave.inventory.combat[chosenWeapon].damage)
            let damageTaken = 0
            let damageMessage = ``
            for (const [key, item] of Object.entries(playerSave.locationsActions.mine.enemies)) {
                replyMessage=replyMessage.concat(`\n${item.name}: Health: ${item.health}`)
                let enemyDamage = rollDice(item.weapon.damage)
                damageTaken+=enemyDamage
                playerSave.locationsActions.mine.health-=damageTaken
                damageMessage=damageMessage.concat(`\n${interaction.user.username} took ${enemyDamage} damage from ${item.name}'s attack. Remaining health: ${playerSave.locationsActions.mine.health}.`)
            }
            interaction.reply(replyMessage)
            interaction.channel.send(damageMessage)
            if(playerSave.locationsActions.mine.health<=0){
                interaction.channel.send(`${interaction.user.username} was defeated`)
			    playerSave.locationsActions.mine = {level:0,enemies:[],oreRemaining:0,health:"start"}
                save(interaction)
                return
            }
            let defeatedString = ``
            playerSave.locationsActions.mine.enemies[chosenEnemy].health-=damageDealt
            if(playerSave.locationsActions.mine.enemies[chosenEnemy].health<=0){
                defeatedString = ` and defeated it, earning ${playerSave.locationsActions.mine.enemies[chosenEnemy].xp} Combat xp and ${playerSave.locationsActions.mine.enemies[chosenEnemy].coins} EarliestCoins`
                playerSave.inventory.coins.coins+=playerSave.locationsActions.mine.enemies[chosenEnemy].coins
                if(playerSave.locationsActions.mine.enemies[chosenEnemy].drops[0] != null){
                    addItemToInventory(playerSave.locationsActions.mine.enemies[chosenEnemy].drops[0], interaction)
                }
                playerSave.skills.combat.xp+=playerSave.locationsActions.mine.enemies[chosenEnemy].xp
                levelUpCheck("combat",interaction,interaction.user)
                interaction.channel.send(`<@${interaction.user.id}> dealt ${damageDealt} damage to ${playerSave.locationsActions.mine.enemies[chosenEnemy].name}${defeatedString}`)
                playerSave.locationsActions.mine.enemies.splice(chosenEnemy, 1)
            }else{
                interaction.channel.send(`<@${interaction.user.id}> dealt ${damageDealt} damage to ${playerSave.locationsActions.mine.enemies[chosenEnemy].name}. Remaining health: ${playerSave.locationsActions.mine.enemies[chosenEnemy].health}`)
            }
            save(interaction)
        }else if(interaction.options.getSubcommand() === "heal"){
            const baseHealingValues = {
                "tiny health potion": 1,
                "small health potion": 5,
                "medium health potion": 10,
                "large health potion": 25,
                "giant health potion": 50
            }
            let healingItem = interaction.options.getString('item')
            if(!baseHealingValues.hasOwnProperty(healingItem)){
                interaction.reply(`${healingItem} is not a valid healing item`)
                return
            }
            let healingMultiplier = 1+Math.floor(playerSave.skills.combat.level/50)
            if(playerSave.inventory.consumables[healingItem]>0){
                playerSave.inventory.consumables[healingItem]--
                playerSave.locationsActions.mine.health+=healingMultiplier*(baseHealingValues[healingItem])
                if(playerSave.locationsActions.mine.health > 10+playerSave.skills.combat.level){
                    playerSave.locationsActions.mine.health = 10+playerSave.skills.combat.level
                }
                interaction.reply(`${interaction.user.username} used a ${healingItem} and now has ${playerSave.locationsActions.mine.health} health.`)
            }else{
                interaction.reply(`You are out of ${healingItem}s`)
                return
            }
            save(interaction)
        }
	},
};