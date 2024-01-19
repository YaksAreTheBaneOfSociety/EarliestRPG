const { Client, Events, GatewayIntentBits, Discord } = require('discord.js');
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
let data = fs.readFileSync("mine.json") // reads the json file
let mine = JSON.parse(data) // turns json into js
let data2 = fs.readFileSync("bank.json") // reads the json file
let bank = JSON.parse(data2) // turns json into js
let data4 = fs.readFileSync("bans.json")
let bans = JSON.parse(data4) // initializes bans file
let data3 = fs.readFileSync("backpain.json") // reads the json file
let backpain = JSON.parse(data3) // turns json into js
let personToHate = '375000202186326017'
function hate(bankArray){
	personToHate = bankArray[Math.floor(Math.random()*bankArray.length)].id
	setTimeout(() => {hate(bankArray)}, 3600000);
}
hate(bank)
// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on("messageCreate", (m) => {

	if (m.channel.id === '1183934610762113124'){
		if (m.content === "!support") {
			let bankIndex = bank.findIndex(element => element.id === m.author.id)
			if(bankIndex == -1){
				m.channel.send('Get a job loser')
			}else if (m.author.id == personToHate){
				let kikimessages = ["fuck you","fuck off","go away","you smell","I hate you","can you leave me alone already","no one likes you","you cant do it"]
				let themessage = kikimessages[Math.floor(Math.random()*kikimessages.length)];
				m.channel.send(themessage)
			}else{
				let supportmessages = ["I love you","You are amazing!","You're doing great!","You can do it!","You're wonderful","Keep going!","You are loved"]
				let themessage = supportmessages[Math.floor(Math.random()*supportmessages.length)];
				m.channel.send(themessage)
			}
		}
		
		let banIndex = bans.findIndex(element => element.id === m.author.id)
	    if (banIndex == -1){

	    	if (m.content === "!advil") { // if message is !mine
				// loops through each element of the array and returns the index of the object with the message author id
				let painIndex = backpain.findIndex(element => element.id === m.author.id)
				if (painIndex !== -1){
					let bankIndex = bank.findIndex(element => element.id === m.author.id)
			      	if (bankIndex !== -1){
						if(bank[bankIndex].generals > 49){
							bank[bankIndex].generals-=50
			    			m.channel.send(`${m.author} has purchased advil for 50 generals. Current back pain: 0%`)
			    			backpain[painIndex].pain=0
						}else{
			    			m.channel.send(`${m.author} does not have 50 generals for advil. Current back pain: ${backpain[painIndex].pain}%`)
						}
					}else{
			    		m.channel.send(`${m.author} does not have an Earliest Credit Union savings account and cannot pay for advil`)
					}
				}else{
	            	// adds an object to the array if user has never ran command before
		    	m.channel.send(`${m.author} has downloaded the Back Pain Management app`)
	   				let userBackpain = {
	        			id: m.author.id,
	        			pain: 0
	        		}
	    		backpain.push(userBackpain)
				}
	        	let jsonBackpain = JSON.stringify(backpain) // turns js back into json
	        	fs.writeFileSync("backpain.json", jsonBackpain) // the json file is now the users variable
		    }	

	    	if (m.content === "!break") { // if message is !mine
				// loops through each element of the array and returns the index of the object with the message author id
				let painIndex = backpain.findIndex(element => element.id === m.author.id)
				if (painIndex !== -1){
					let bankIndex = bank.findIndex(element => element.id === m.author.id)
			      	if (bankIndex !== -1){
						if(backpain[painIndex].pain >= 50){
							let painreduction = Math.floor(Math.random() * 25)
				    		if (painreduction < 5){
				    			painreduction=5
				    		}
				    		backpain[painIndex].pain-=painreduction
				    		if (backpain[painIndex].pain < 0){
				    			backpain[painIndex].pain=0
				    		}

				    		m.channel.send(`${m.author} has rested their back. Current back pain: ${backpain[painIndex].pain}%`)
				    	}else{
				    		let painreduction = Math.floor(Math.random() * 25)
				    		if (painreduction < 5){
				    			painreduction=5
				    		}
				    		backpain[painIndex].pain-=painreduction
				    		if (backpain[painIndex].pain < 0){
				    			backpain[painIndex].pain=0
				    		}
							bank[bankIndex].generals-=Math.abs(bank[bankIndex].wage*10)
				    		m.channel.send(`${m.author} has rested their back. Current back pain: ${backpain[painIndex].pain}%`)
				    		m.channel.send(`${m.author} was fined ${Math.abs(bank[bankIndex].wage*10)} generals for taking an unnecessary break`)
				    	}
				    }else{
				    	m.channel.send(`${m.author} cannot take a break as they do not have a bank account`)
				    }
				}else{
	            	// adds an object to the array if user has never ran command before
		    	m.channel.send(`${m.author} has downloaded the Back Pain Management app`)
	   				let userBackpain = {
	        			id: m.author.id,
	        			pain: 0
	        		}
	    		backpain.push(userBackpain)
				}
	        	let jsonBackpain = JSON.stringify(backpain) // turns js back into json
	        	fs.writeFileSync("backpain.json", jsonBackpain) // the json file is now the users variable
		    }	

			if (m.content === "!mineharder") { // if message is !mine
				// loops through each element of the array and returns the index of the object with the message author id
			    let bankIndex = bank.findIndex(element => element.id === m.author.id)
			    if (bankIndex !== -1){
					let painIndex = backpain.findIndex(element => element.id === m.author.id)
					if (painIndex !== -1){
						let painincrease = Math.floor(Math.random() * 10)
						if (painincrease < 5){
			    			painincrease=5
			    		}
			    		backpain[painIndex].pain+=painincrease
			    		if(backpain[painIndex].pain > 99){
			    			bank[bankIndex].generals-=500
					    	m.channel.send(`${m.author} hurt their back and was billed 500 generals for treatment`)
					    	backpain[painIndex].pain=0
			    		}else{
				      			let promotionchance = 1.2/(Math.PI*bank[bankIndex].wage+250)
				      			if (promotionchance > 0.5 || promotionchance < 0){
				      				promotionchance = 0.5
				      			}
//			    				m.channel.send(`**LOG MESSAGE IGNORE THIS**\n promotion chance = ${promotionchance}. \nyes i could log this to the console but fuck you im putting it in here`)
				      			let randomroll = Math.random()
//					    		m.channel.send(`**LOG MESSAGE IGNORE THIS**\n promotion chance = ${promotionchance}. \nrandom roll = ${randomroll}\nyes i could log this to the console but fuck you`)
				      		if (randomroll < promotionchance){
				      			mine[0]+=20*(bank[bankIndex].placeholder2 + 1); // adds pickaxe level * 10 of generals
				    			bank[bankIndex].wage++//adds 1 to wage
				    			m.channel.send(`${m.author} found a large vein of ${20*(bank[bankIndex].placeholder2 + 1)} generals and was given a raise. their new wage is ${bank[bankIndex].wage} general(s).`)
				    		}else if (Math.random() < 0.04){
				      			mine[0]+=2*(bank[bankIndex].placeholder2 + 1) // adds pickaxe level of generals
				    			bank[bankIndex].generals+=bank[bankIndex].wage*3//adds wage times 3 to current bank balance
				    			m.channel.send(`${m.author} mined ${2*(bank[bankIndex].placeholder2 + 1)} pieces of general for the server. The mine boss liked the cut of their jib and gave them a ${bank[bankIndex].wage*3} general bonus`)
				    			bank[bankIndex].placeholder1++
				    		}else if (bank[bankIndex].placeholder1 % 12 === 0){
				      			mine[0]+=2*(bank[bankIndex].placeholder2 + 1) // adds pickaxe level of generals
				    			bank[bankIndex].generals+=bank[bankIndex].wage//adds wage to current bank balance
				    			m.channel.send(`${m.author} mined ${2*(bank[bankIndex].placeholder2 + 1)} pieces of general for the server and was paid their wage of ${bank[bankIndex].wage} general(s).`)
				    			bank[bankIndex].placeholder1++
				    		}else{
				        		mine[0]+=2*(bank[bankIndex].placeholder2 + 1) // adds pickaxe level of generals
				    			m.channel.send(`${m.author} mined ${2*(bank[bankIndex].placeholder2 + 1)} pieces of general for the server`)
				    			bank[bankIndex].placeholder1++
				    		}	
			    			m.channel.send(`${m.author} has worked hard and stressed their back. Current back pain: ${backpain[painIndex].pain}%`)
				    	} 
		      	 		let jsonMine = JSON.stringify(mine) // turns js back into json
		        		fs.writeFileSync("mine.json", jsonMine) // the json file is now the mine variable
	        			let jsonBank = JSON.stringify(bank) // turns js back into json
	        			fs.writeFileSync("bank.json", jsonBank) // the json file is now the users variable
					}else{
	            		// adds an object to the array if user has never ran command before
		    			m.channel.send(`${m.author} has downloaded the Back Pain Management app`)
	   					let userBackpain = {
	        				id: m.author.id,
	        				pain: 0
	        			}
	    			backpain.push(userBackpain)
					}
			    }else{
		    		m.channel.send(`${m.author} does not have an Earliest Credit Union savings account`)
			    }
	        	let jsonBackpain = JSON.stringify(backpain) // turns js back into json
	        	fs.writeFileSync("backpain.json", jsonBackpain) // the json file is now the users variable
		    }	    	

			if(m.content === "!lawyer"){
				m.channel.send(`${m.author} is not currently on trial for any crimes.`)
			}

			if (m.content === "!bribery") {
		      	let bankIndex = bank.findIndex(element => element.id === m.author.id)
		      	if (bankIndex !== -1){
		      		if (bank[bankIndex].generals > 100){
				    	bank[bankIndex].generals-=100//removes 100 generals
				      	if (Math.random() < 0.002){
				    		bank[bankIndex].generals+=mine[0]//adds generals balance of server to bank account
				    		mine[0]=0//sets mine balance to 0
				    		m.channel.send(`${m.author} bribed the mine boss with 100 generals. ${mine[0]} generals have gone missing from the server's supply room.`)
				    	}else if (Math.random() < 0.01){
				    		bank[bankIndex].generals+=1000//adds 1000 to bank account
				    		mine[0]-=1000//removes 1000 generals
				    		m.channel.send(`${m.author} bribed the mine boss with 100 generals. 1000 generals have gone missing from the server's supply room.`)
				    	}else if (Math.random() < 0.25){
		            	// adds an object to the array if user has never ran command before
			    			m.channel.send(`${m.author} tried to bribe the mine boss with 100 generals. They were taken to jail to await their court date.`)
			    			m.channel.send(`${m.author}, Type !lawyer to defend yourself in court`)
			   				let userObject = {
			        			id: m.author.id,
			        			court: 0,
			        			time: 120,
			       				crime: 'bribery'
			    			}
		    				bans.push(userObject)
				    	}else if (Math.random() < 0.01){
				    		m.channel.send(`${m.author} tried to bribe the mine boss with 100 generals. They were fined 500 generals for trying to do so.`)
				    	}else{
				    		m.channel.send(`${m.author} tried to bribe the mine boss with 100 generals. The mine boss laughed them out of the room.`)
				    	}	
				    }else{
				    	m.channel.send(`${m.author} does not have 100 generals to bribe the mine boss`)
				    }
		      	} else{
			    	m.channel.send(`${m.author} does not have a savings account with Earliest Credit Union, so why would they think they could bribe the mine boss? idiot.`)
		    	}
		        let jsonMine = JSON.stringify(mine) // turns js back into json
		        fs.writeFileSync("mine.json", jsonMine) // the json file is now the mine variable
	        	let jsonBank = JSON.stringify(bank) // turns js back into json
	        	fs.writeFileSync("bank.json", jsonBank) // the json file is now the users variable
			}

			if (m.content === "!upgrade") { // if message is !mine
				// loops through each element of the array and returns the index of the object with the message author id
				let bankIndex = bank.findIndex(element => element.id === m.author.id)
				if (bankIndex !== -1){
		    		m.channel.send(`${m.author} has pickaxe level ${bank[bankIndex].placeholder2 + 1}. They can upgrade their pickaxe for ${(50*(bank[bankIndex].placeholder2)**(2))+250} generals. Type !upgradeconfirm to upgrade.`)
		    	}else{
			    	m.channel.send(`${m.author} does not have a savings account with Earliest Credit Union, so why would they think they could pay for a pickaxe upgrade? idiot.`)
				}
		       	let jsonBank = JSON.stringify(bank) // turns js back into json
		       	fs.writeFileSync("bank.json", jsonBank) // the json file is now the users variable
		    }

			if (m.content === "!upgradeconfirm") { // if message is !mine
				// loops through each element of the array and returns the index of the object with the message author id
				let bankIndex = bank.findIndex(element => element.id === m.author.id)
				if (bankIndex !== -1){
					if(bank[bankIndex].generals > (50*(bank[bankIndex].placeholder2)**(2))+250){
						bank[bankIndex].generals-=((50*(bank[bankIndex].placeholder2)**(2))+250)
						bank[bankIndex].placeholder2++
		    			m.channel.send(`${m.author} upgraded their pickaxe to level ${bank[bankIndex].placeholder2 + 1}`)
		    			bank[bankIndex].generals = Math.floor(bank[bankIndex].generals / 2)//sets generals to half of current
			   		}else{
		    			m.channel.send(`${m.author} does not have ${(50*(bank[bankIndex].placeholder2)**(2))+250} generals to upgrade their pickaxe.`)
		    			bank[bankIndex].generals++//adds one general
			   		}
				}else{
		    	m.channel.send(`${m.author} does not have a savings account with Earliest Credit Union, so why would they think they could pay for a pickaxe upgrade? idiot.`)
				}
		     	let jsonBank = JSON.stringify(bank) // turns js back into json
		      	fs.writeFileSync("bank.json", jsonBank) // the json file is now the users variable
			}

			if (m.content === "!myemployment") { // if message is !mine
				// loops through each element of the array and returns the index of the object with the message author id
				let bankIndex = bank.findIndex(element => element.id === m.author.id)
				if (bankIndex !== -1){
		    		m.channel.send(`${m.author}'s wage is ${bank[bankIndex].wage} general(s).`)
		    		m.channel.send(`${m.author} has mined a total of ${bank[bankIndex].placeholder1} times.`)
				}else{
	            	// adds an object to the array if user has never ran command before
		    	m.channel.send(`${m.author} is working as an unpaid intern`)
				}
	        	let jsonBank = JSON.stringify(bank) // turns js back into json
	        	fs.writeFileSync("bank.json", jsonBank) // the json file is now the users variable
		    }

			if (m.content === "!mysavings") { // if message is !mine
				// loops through each element of the array and returns the index of the object with the message author id
				let bankIndex = bank.findIndex(element => element.id === m.author.id)
				if (bankIndex !== -1){
		    		m.channel.send(`${m.author}'s balance is ${bank[bankIndex].generals} general(s).`)
		    		m.channel.send(`${m.author}'s balance is ${bank[bankIndex].gold} gold.`)
		    		m.channel.send(`${m.author}'s balance is ${bank[bankIndex].diamonds} gemstone(s).`)
				}else{
	            	// adds an object to the array if user has never ran command before
		    	m.channel.send(`${m.author} has started a standard savings account with Earliest Credit Union`)
	   				let userObject = {
	        			id: m.author.id,
	        			generals: 0,
	        			gold: 0,
	        			diamonds: 0,
	        			wage: 0,
	        			miners: 0,
	        			placeholder1: 0,//times mined total
	        			placeholder2: 0,//pickaxe level
	        			placeholder3: 0//is currently renting?
	    			}
	    		bank.push(userObject)
				}
	        	let jsonBank = JSON.stringify(bank) // turns js back into json
	        	fs.writeFileSync("bank.json", jsonBank) // the json file is now the users variable
		    }

			if (m.content === "!minegreedy") { // if message is !mine
				// loops through each element of the array and returns the index of the object with the message author id
				let bankIndex = bank.findIndex(element => element.id === m.author.id)
				if (bankIndex !== -1){
					if(Math.random() < 0.001){
		    			m.channel.send(`${m.author} was fined for stealing generals, and ordered to pay ${Math.floor(bank[bankIndex].generals / 2)} generals.`)
		    			bank[bankIndex].generals = Math.floor(bank[bankIndex].generals / 2)//sets generals to half of current
		    		}else if(Math.random() < 0.009){
		    			m.channel.send(`${m.author} was fined for stealing generals, and ordered to pay 250 generals.`)
		    			bank[bankIndex].generals-=250//removes 250 generals
		    		}else if(Math.random() < 0.01){
		    			m.channel.send(`${m.author} was fined for stealing generals, and ordered to pay 25 generals.`)
		    			bank[bankIndex].generals-=25//removes 25 generals
		    		}else if (Math.random() < 0.0025){
		    			m.channel.send(`${m.author} was caught pocketing generals, and their wages were docked by 1 general`)
		    			bank[bankIndex].wage--//reduces wage by 1
		    		}else if (Math.random() < 0.025){
		            	// adds an object to the array if user has never ran command before
			    		m.channel.send(`${m.author} was caught stealing generals. They were taken to jail to await their court date.`)
			    		m.channel.send(`${m.author}, Type !lawyer to defend yourself in court`)
			   			let userObject = {
			       			id: m.author.id,
			       			court: 0,
			       			time: 60,
			       			crime: 'stealing'
			   			}
		   				bans.push(userObject)
				    }else if (Math.random() < 0.005){
		    			m.channel.send(`${m.author} mined one piece of gold and pocketed it when no one was looking`)
		    			bank[bankIndex].gold++//adds 1 to gold
		    		}else if (Math.random() < 0.0001){
		    			m.channel.send(`${m.author} mined a gemstone and pocketed it when no one was looking`)
		    			bank[bankIndex].diamonds++//adds a gemstone
		    		}else{
		    			m.channel.send(`${m.author} mined ${bank[bankIndex].placeholder2 + 1} piece(s) of general for themself. greedy asshole.`)
		    			bank[bankIndex].generals+=(bank[bankIndex].placeholder2 + 1)//adds pickaxe level of generals
		    		}
				}else{
		    	m.channel.send(`${m.author} does not have a savings account with Earliest Credit Union`)
				}
	        	let jsonBank = JSON.stringify(bank) // turns js back into json
	        	fs.writeFileSync("bank.json", jsonBank) // the json file is now the users variable
		    }

		    if (m.content === "!mine") { // if message is !mine
		      	let bankIndex = bank.findIndex(element => element.id === m.author.id)
		      	if (bankIndex !== -1){
		      		let promotionchance = 1/(10*Math.PI*bank[bankIndex].wage+250)
		      		if (promotionchance > 0.5 || promotionchance < 0){
		      			promotionchance = 0.5
		      		}
//			    	m.channel.send(`**LOG MESSAGE IGNORE THIS**\n promotion chance = ${promotionchance}. \nyes i could log this to the console but fuck you im putting it in here`)
		      		let randomroll = Math.random()
//			    	m.channel.send(`**LOG MESSAGE IGNORE THIS**\n promotion chance = ${promotionchance}. \nrandom roll = ${randomroll}\nyes i could log this to the console but fuck you`)
			      	if (randomroll < promotionchance){
			      		mine[0]+=10*(bank[bankIndex].placeholder2 + 1); // adds pickaxe level * 10 of generals
			    		bank[bankIndex].wage++//adds 1 to wage
			    		m.channel.send(`${m.author} found a large vein of ${10*(bank[bankIndex].placeholder2 + 1)} generals and was given a raise. their new wage is ${bank[bankIndex].wage} general(s).`)
			    	}else if (bank[bankIndex].placeholder1 % 25 === 0){
			      		mine[0]+=(bank[bankIndex].placeholder2 + 1) // adds pickaxe level of generals
			    		bank[bankIndex].generals+=bank[bankIndex].wage//adds wage to current bank balance
			    		m.channel.send(`${m.author} mined ${bank[bankIndex].placeholder2 + 1} piece(s) of general for the server and was paid their wage of ${bank[bankIndex].wage} general(s).`)
			    		bank[bankIndex].placeholder1++
			    	}else{
			        	mine[0]+=(bank[bankIndex].placeholder2 + 1) // adds pickaxe level of generals
			    		m.channel.send(`${m.author} mined ${bank[bankIndex].placeholder2 + 1} piece(s) of general for the server`)
			    		bank[bankIndex].placeholder1++
			    	}	
		      	} else{
			        mine[0]++ // adds 1 general
			    	m.channel.send(`${m.author} mined one piece of general for the server. They are working for free as they do not have an Earliest Credit Union savings account.`)
		    	}
		        let jsonMine = JSON.stringify(mine) // turns js back into json
		        fs.writeFileSync("mine.json", jsonMine) // the json file is now the mine variable
	        	let jsonBank = JSON.stringify(bank) // turns js back into json
	        	fs.writeFileSync("bank.json", jsonBank) // the json file is now the users variable
		    }

		    if (m.content === "!mine tax") { // if message is !mine tax
		    	if (m.author.bot === true){//if user is a bot
		    		if(mine[0]>Math.floor(mine[0]*0.45)+999){
		    			m.channel.send(`Server has paid taxes of ${Math.floor(mine[0]*0.45)} generals`)
		        		mine[0]-=Math.floor(mine[0]*0.45) // removes 500 generals
		        		mine[0]-=1000 // removes 500 generals
		    			m.channel.send("Server has paid mine operating costs of 1000 generals")
		        	} else{
		        		mine[0]=0
		        		bank=[]
		    			m.channel.send("Server has gone bankrupt. All bank accounts have been seized.")
		        	}
		        let jsonMine = JSON.stringify(mine) // turns js back into json
		        fs.writeFileSync("mine.json", jsonMine) // the json file is now the mine variable
	        	let jsonBank = JSON.stringify(bank) // turns js back into json
	        	fs.writeFileSync("bank.json", jsonBank) // the json file is now the users variable
		    	}
		    }

		    if (m.content === "!generals") { // if message is !generals
		    	m.channel.send(`Current Server Balance: ${mine[0]} generals`)
		    }
			
			let jsonBans = JSON.stringify(bans) // turns js back into json
			fs.writeFileSync("bans.json", jsonBans) // the json file is now the bans variable
		}else {
			if (m.content === "!generals" || m.content === "!mine" || m.content === "!mysavings" || m.content === "!myemployment" || m.content === "!minegreedy" || m.content === "!upgradeconfirm" || m.content === "!upgrade" || m.content === "!bribery") {
				if(bans[banIndex].court === 0){
					m.channel.send(`${m.author} is in jail and cannot enter the mine. Type !lawyer to defend yourself in court.`)
				}else{
					m.channel.send(`${m.author} is in prison and cannot enter the mine. Wait until your sentence is up.`)
				}
			}
			if(m.content === "!lawyer"){
				if(bans[banIndex].court === 0){
					try{	
						if (Math.random() < 0.001){
							m.channel.send(`${m.author} hired Parkzer to defend them in court. They were found **NOT GUILTY**`)
							bans.splice(banIndex, 1)
						}else if (Math.random() < 0.049){
							m.channel.send(`${m.author} was assigned a public defender. They were found **NOT GUILTY**`)
							bans.splice(banIndex, 1)
						}else if (Math.random() < 0.01){//0.01
							m.channel.send(`${m.author} was assigned a public defender. They were found **GUILTY** and sentenced to ${bans[banIndex].time/2} minute(s) in prison`)
							bans[banIndex].court=1
							setTimeout(() => {
								m.channel.send(`${m.author} was released from prison`)
								bans.splice(banIndex, 1)
							}, bans[banIndex].time*1000*30);
						}else{
							m.channel.send(`${m.author} was assigned a public defender. They were found **GUILTY** and sentenced to ${bans[banIndex].time/60} minute(s) in prison.`)
							bans[banIndex].court=1
							setTimeout(() => {
								m.channel.send(`${m.author} was released from prison`)
								bans.splice(banIndex, 1)
							}, bans[banIndex].time*1000);
						}
					}catch(err){
						m.channel.send(`ERROR AAAAAAA PANIC:\n${err}`)
						bans.splice(banIndex, 1)
						let userObject = {
							id: m.author.id,
							court: 1,
							time: 600,
							crime: 'destroying court documents'
						}
						bans.push(userObject)
						banIndex = bans.findIndex(element => element.id === m.author.id)
						m.channel.send(`${m.author} was found **GUILTY** of destroying court documents and sentenced to ${bans[banIndex].time/60} minute(s) in prison.`)
			    		setTimeout(() => {
							m.channel.send(`${m.author} was released from prison`)
							bans.splice(banIndex, 1)
						}, bans[banIndex].time*1000);
					}
				} else{
					m.channel.send(`${m.author} was already tried and found **GUILTY** of ${bans[banIndex].crime}.`)
				}
			}
		}
	}
})
// Log in to Discord with your client's token
client.login(token);