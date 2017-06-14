/* dependencies */
const http = require("http");
const fs = require("fs");                               // file system
const path = require("path");                           // access paths
const express = require("express");                     // express
const MongoClient = require('mongodb').MongoClient;     // talk to mongo
const bodyParser = require('body-parser');              // parse request body
var session = require('express-session')				// create sessions
var db;													// placeholder for our database

const app = express();
app.set("port", process.env.PORT || 3000)				// we're gonna start a server on whatever the environment port is or on 3000
app.set("views", path.join(__dirname, "views"));        // tells us where our views are
app.set("view engine", "ejs");                          // tells us what view engine to use

app.use(express.static(__dirname + '/'));               // sets the correct views for the CSS file/generally accessing files

const main = require("./app/main");
const dataops = require("./app/database");

var processingAttacks = false;


/* Unit cost*/
/* THIS IS TERRIBLE AND NEEDS TO BE MOVED TO A DB*/

var unitCost = {
	"worker": 50,
	"footman": 100,
	"archer": 200
}

var names = ["Lisa", "Joseph", "Mara", "Athena", "Cassie", "Norra", "Brad", "Becky", 
"Jason", "Farheed", "Anastasia", "Marcy", "Chegg", "Robert", "Nicholas", "Andrey", "Frank", "Joe"];

var jobMessage = {
	coin: "Mining coin",
	food: "Gathering food"
}


/* Connecting to the DB */


MongoClient.connect("mongodb://localhost:27017/conquest", function(err, database){
	if (err){
		console.log("MAYDAY! MAYDAY! Crashing.");
		return console.log(err);
	}

	console.log("Got the database!");

	db = database;										// mongo passes us a database, we store its contents in this variable... I think.
	
	app.use(bodyParser.urlencoded({
	    extended: true
	}));

	app.use(bodyParser.json()); 						// for parsing application/json


	app.use(session({
		secret: 'awfulPassword',
	 	saveUninitialized: false,
	 	resave: false,
	 	secure: false,
	 	cookie: {}
	}));

	app.use(function(req, res, next){                  							// logs request URL
	    var timeNow = new Date();
	    console.log("Request: " + req.method.toUpperCase() + " " + req.url + " on " + timeNow);	
	    next();
	});

	app.use(function(req, res, next) {											// makes session available to all views
	 	app.locals.session = req.session;
	 	app.locals.error = req.session.error;									// making copies like this is clunky, but it works
	 	app.locals.message = req.session.message;
	 	req.session.error = null;
	 	req.session.message = null;
	 	next();
	})

	// every time a request comes in, we want to resolve all the actions.

	/* for example, let's say all attacks have to be blocked within 10 minutes.

	1. get all actions where date < (now - 10 mins)
	2. for each action, update the HP for relevant players <-- how will the player find out?
	3. delete the action object

	*/

	app.use(function resolveAttacks(req, res, next){
		if(!processingAttacks){												// if we're already working on processing attacks...
			console.log("=== RESOLVING ATTACKS ====");

			var tenMinutesAgo = Date.now() - (1000*60*10); 				// we're in milliseconds by default
			var tenSecondsAgo = Date.now() - (1000*10);
			var oneHourAgo = Date.now() - (1000*60*60);

			var actionCounter = 0;


			var allActions = {
				
				date: {$lt: tenSecondsAgo},				// this is a mongo query for less than
				type: "attack"							// date < 10 seconds ago means date that is older than 10 seconds
			}


			dataops.find(db, "action", allActions, res, function resolveAllActions(allUnresolvedActions){
				console.log("Fetched " + allUnresolvedActions.length + " actions");
				if(allUnresolvedActions.length > 0){

					processingAttacks = true;

					console.log("======== FOUND UNRESOLVED ACTIONS ======");
					console.log("resolving " + allUnresolvedActions.length + " actions.");

					resolveAttack(actionCounter); // get this baby started

					function resolveAttack(actionCounter){
						console.log("======== ONE: RESOLVING AN UNRESOLVED ACTION ======");
						var unresolvedAction = allUnresolvedActions[actionCounter];			// sets our unresolved action to the correct element from the unresolved actions array
						console.log("resolving action " + unresolvedAction.date);

						var actionTarget = {
							name: unresolvedAction.to
						}


						// get the HP for the player this action is targeting:

						dataops.find(db, "player", actionTarget, res, function calculateNewHP(playerToDamage){
							console.log("======== TWO: GRABBED PLAYER TO DAMAGE ======");

							var hpUpdateQuery = {
								"stats.hp": (playerToDamage[0].stats.hp - unresolvedAction.data.weight)				// decrease HP by the weight of the attack
							}

							dataops.update(db, "player", playerToDamage[0], hpUpdateQuery, res, false, null, null, function updatePlayerHP(updatedPlayer){
								console.log("======== THREE: UPDATED TARGETED PLAYER'S HEALTH ======");
								console.log("Health decreased! The new health for player " + updatedPlayer[0].name + " is " + updatedPlayer[0].stats.hp);

								var actionToRemove = {
									date: unresolvedAction.date
								}

								dataops.remove(db, "action", actionToRemove, res, function removeAction(confirmationMessage){
									console.log("======== FOUR: REMOVED ACTION ======");
									console.log("removed action " + unresolvedAction.date);
									
									if ((actionCounter+1) < allUnresolvedActions.length){
										actionCounter++;
										resolveAttack(actionCounter);					// this SUPPOSEDLY forces the counter to run in a synchronour manner
									} else {
										processingAttacks = false;
										next();
									}
								})
							})
						})

					}

					console.log("=== DONE RESOLVING ATTACKS ====");
					

				} else {
					console.log("no unresolved actions found. moving on.")
					console.log("=== DONE RESOLVING ATTACKS ====");
					next();
				}
				
			});
		} else {
			console.log("already processing attacks");
			next();
		}
	});


	app.use(function addResources(req, res, next){

		/*
			1. find all unit where the job isn't "none"
			2. add 10 to the onwer's corresponding resource
			3. update the unit's "last update" 
			3. rewrite code till this works
		*/

		var updateInterval = 20;			// in seconds

		var unitQuery = {
			type: "worker",
			job: {
				$ne: "none"
			}			
		}

		// look up all working worker units

		dataops.find(db, "unit", unitQuery, res, function allWorkingUnits(units){
			if(units.length > 0){
				console.log("Found " + units.length + " units to process for resources");
				actionCounter = 0;				// forcing synchrony :(
				units.forEach(function(unit){

					console.log("working on " + unit.type + ", id: " + unit.id);
					//look up player for each of these

					var playerQuery = {
						name: unit.owner
					}

					dataops.find(db, "player", playerQuery, res, function queryPlayerForUpdate(player){
						if(player.length > 0){
							console.log("this " + unit.type + " belongs to " + player[0].name)

							//update player's correct resource if it has been 10 seconds

							var timeSinceLastUpdate = Math.floor(((Date.now() - unit.lastUpdated)/1000))			// need to figure out how much time to add here
							var updatesDue = Math.floor(timeSinceLastUpdate/updateInterval);
							var updateAtTime = Date.now() - ((Date.now() - unit.lastUpdated) - (timeSinceLastUpdate)*1000); // this HOPEFULLY gets that remainder between time now and time due for last update.

							console.log("It has been " + timeSinceLastUpdate + " seconds since the last update. We're due " + updatesDue + " updates.");

							if(updatesDue > 0){
								var resourceCount = "resources." + unit.job + ".count";
		    					var playerUpdateQuery = {}													// decrease how much coin the player has
		    					var additionalResource = 1*player[0].stats.econ_level*updatesDue										// this is where the magic happens. 
		    					playerUpdateQuery[resourceCount] = player[0]["resources"][unit.job]["count"] + additionalResource;		// this is where the magic happens. 
								


								// update the player's coin count
								dataops.update(db, "player", playerQuery, playerUpdateQuery, false, null, null, res, function updateResource(updatedPlayer){
									console.log("success! updated " + playerUpdateQuery.resource + " for player " + updatedPlayer[0].name);
									dataops.update(db, "unit", {id: unit.id}, {lastUpdated: updateAtTime}, false, null, null, res, function updateUnitTime(updatedUnit){
										console.log("success! updated " + updatedUnit[0].id);
									})

								})
							}

						} else {
							console.log("weird, no such player named " + unit.owner + " for unit id: " + unit.id);
						}
					});

				});
				next();
			} else {
				console.log("No units to process for resources");
				next();
			}
		});
	});

	app.get("/", function(req, res){
	    res.render("index");
	});



	// load a game
	
	app.get("/game", function(req, res){							/* !!! need to make sure a player BELONGS to a game before they're able to see this. */
		console.log("GETTING /GAME");

		/* What do we need when a game loads?
			- all the logged in player info
			- all the info about opponents
			- all the actions against a player
			- all the player's units
			
		*/	


		if(req.session.user){
			dataops.find(db, "player", req.body, res, function getAllPlayers(all_players){	// get all the players
				
				var query_to = {										// we're looking for all actions where the "to" attribute is the current player
					to: req.session.user.name
				}

				var query_from = {										// we're looking for all actions where the "from" attribute is the current player
					from: req.session.user.name
				}

				dataops.findAction(db, "action", { $or: [ query_from, query_to]}, res, function getAllActions(all_actions){
			    	dataops.find(db, "unit", {owner: req.session.user.name}, res, function getAllUnits(units){
			    		var current_player = all_players.filter(function(el){			// filter the current player by ID stored in session
				    		return el._id == req.session.user._id;
				    	});

			    		var all_units = units.filter(function(unit){
			    			return unit.owner == req.session.user.name
			    		})


			    		var workers = all_units.filter(function(unit){ return unit.type =="worker" });
			    		var footmen = all_units.filter(function(unit){ return unit.type == "footman" });
			    		var archers = all_units.filter(function(unit){ return unit.type == "archer"  });
			    		var scouts = all_units.filter(function(unit){ return unit.type == "scout"  });

			    		var player_units = {
			    			worker: workers,
			    			footman: footmen,
			    			archer: archers,
			    			scout: scouts
			    		}



			    		res.render("game", {player: current_player[0], opponents: all_players, actions: all_actions, units: player_units});	
			    	});
		    	});
			});
		} else {
			req.session.message = "You need to log in";
			res.redirect("/login");
		}
	});

	app.get("/newplayer", function(req, res){
		res.render("newplayer", {"session": req.session});
	});


var text = "hello there!";

	app.get("/test", function(req, res){
		res.render("test", {message: text});
	})

	app.post("/test", function(req, res){
		res.send(text);
	})


	app.post("/newplayer", function(req, res){
		console.log(req.body);
		if((req.body.name).replace(/\s/g, '').length > 0 && (req.body.capital).replace(/\s/g, '').length > 0){			// let's make sure the input name isn't empty	
			var newPlayer = {
				name: req.body.name,
				capital: req.body.capital,
				walls: "wood",
				stats: {
					hp: 100,
					strength: 10,
					walls: "wood",
					econ_level: 1,
					military_level: 1
				},
				resources: {
					coin: {
						count: 1000, 
						lastUpdated: Date.now()
					},
					food: {
						count: 0, 
						lastUpdated: Date.now()
					}
				}
			}

			var newScout = {
				type: "scout",
				lastUpdated: Date.now(),
				owner: newPlayer.name,
				job: "none",
				id: Date.now()
			}

			dataops.addNewPlayer(db, "player", newPlayer, res, function addUnits(newPlayerMessage){
				dataops.add(db, "unit", newScout, res, function (result){
					req.session.message = newPlayerMessage;
					res.redirect("/login");
				});	
			});

		} else {
			res.send("cannot save player with no name or capital");
		}
		
	});

	app.get("/login", function(req, res){
		res.render("login");
	});

	app.post("/login", function(req, res){
		console.log(req.body);
		if((req.body.name).replace(/\s/g, '').length >0){
			dataops.find(db, "player", {name: req.body.name}, res, function displayPlayer(result){
				if(result.length > 0){
					req.session.user = result[0];

					var day = 60000*60*24;

					req.session.expires = new Date(Date.now() + (30*day));			// this helps the session keep track of the expire date
					req.session.cookie.maxAge = (30*day);							// this is what makes the cookie expire
					console.log("Cookie set! ");
				//	console.log(req.session.cookie);
					res.redirect("/game");
				} else {
					req.session.user = null;
					res.render("login", {error: "incorrect login"});
				}
			});
		} else {
			res.render("login", {error: "blank username"});
		}
	
	});


	app.get("/time-to-logout", function(req, res){
/*		console.log("req.session.expires:");
		console.log(req.session.expires);*/
		res.send(req.session.expires);
	});

	app.get("/logout", function(req, res){
		req.session.user = null;
		req.session.expires = new Date(Date.now);		/* not sure if this is needed*/
		res.render("index", {error: "Logged out"});
	})


	app.get("/allplayers", function(req, res){
	    dataops.find(db, "player", req.body, res, function(result){
	    	res.render("allplayers", { "players": result, "session": req.session });
	    });
	});

	app.delete("/allplayers", function(req, res){
		dataops.deletePlayer(db, "player", req.body, res, function(result){
		res.send(result);
		});
	});




	/* game actions */


	app.post("/game", function(req, res){
		// console.log("req.body:");
		// console.log(req.body);
		if(typeof(req.session.user) != "undefined"){				// this prevents users who are not logged in from crashing the server with their attacks
			if(req.body.action == "scout"){

				console.log("got the ajax call...");

				var pl = {
					"name": req.session.user.name
				}

				dataops.find(db, "player", pl, res, function getPlayerHP(currentPlayer){
					console.log("pl hp is: " + currentPlayer[0].stats.hp);
					var q = { 
						"stats.hp": (currentPlayer[0].stats.hp + 10)
					};

					dataops.update(db, "player", pl, q, res, false, null, null, function updateScreen(result){
						console.log("Done updating");	
						req.session.user = result[0];
						res.send(req.session.user);
					});
				})


			}

			if(req.body.action == "build"){
				res.send("let me get the bricks.");
			}


			if(req.body.action == "attack"){
				console.log("back end: received attack");
				
				// pull the player's data:

				var dt = Date.now();
				var targetPlayer = {
					name: req.body.player
				}; 
				var action = {
					type: "attack",
					from: req.session.user.name,
					to: targetPlayer.name,
					date: dt,
					expires: (1000*10), 					// in MS
					data: {
						weight: req.session.user.stats.strength
					}
				};

				 dataops.add(db, "action", action, res, function(targetPlayer){
			    	res.send("Server: viciously attacked " + req.body.player);
			    });
				
			}

			if(req.body.action == "block-auto"){
				console.log("back end: received block-to for oldest attack");

				var currentPlayer = {
					name: req.session.user.name
				}; 
				var query = {
					type: "attack", 
					to: req.session.user.name
				};

				/* 
					I need to figure out how to remove the most recent attack. Check out the $sort mongo function
				*/


				// search for all actions with the type attack against the current player:
				// sort in a descending order (oldest first)

				dataops.findAction(db, "action", query, res, function(actions_against_player){		
					console.log("Oldest attack attack:");
					console.log(actions_against_player[0]);
					if(typeof(actions_against_player)[0] != "undefined"){
						dataops.remove(db, "action", {date: actions_against_player[0].date}, res, function(result){			
							res.send({date: actions_against_player[0].date, message: "blocked action!"});
						});
					} else {
						res.send({message: "there's nothing to block!"});
					}
				});			
			}

			if(req.body.action == "block-single-attack"){
				console.log("back end: received block for a specific attack");

				var currentPlayer = {
					name: req.session.user.name
				}; 
				var query = {
					date: parseInt(req.body.date)
				};

				dataops.findAction(db, "action", query, res, function(actions_against_player){		
					console.log("Most recent attack:");
					console.log(actions_against_player[0]);
					if(typeof(actions_against_player)[0] != "undefined"){
						dataops.remove(db, "action", {date: actions_against_player[0].date}, res, function(result){			
							res.send({date: actions_against_player[0].date, message: "blocked action!"});
						});
					} else {
						res.send({message: "there's nothing to block!"});
					}
					

					
				});

		    }




	    	if(req.body.action == "getUpdatedInfo"){

				console.log("====================");
	    		console.log("SERVER: getting updated health");
	    		

	    		query = {
	    			name: req.session.user.name
	    		}

	    		dataops.find(db, "player", query, res, function(player){
	    			console.log("Updated user health is: " + player[0].stats.hp)

	    			var updatedHealth = {
	    				hp: player[0].stats.hp
	    			}
	    			console.log("====================");
	    			res.send(updatedHealth);
	    		});
		
	    	}


	    	if(req.body.action == "fetchActions"){


	    		console.log("SERVER:  fetching all the actions against the player")


	    		actionQuery = {
	    			to: req.session.user.name
	    		}

	    		dataops.find(db, "action", actionQuery, res, function actionsAgainstPlayer(actions) {
	    			if(actions.length > 0){
	    				res.send({message: "SERVER: found actions against " + req.session.user.name, data: actions});
	    			} else {
	    				res.send({message: "fail", data: "SERVER: There are no actions against this player"});
	    			}


	    		})
	    	}

	    	if(req.body.action == "buy"){
	    		console.log("SERVER: Gonna buy us a bitch");

	    		
	    			console.log("SERVER: Gonna buy us a sword bitch with feet");

	    			playerQuery = {
	    				name: req.session.user.name
	    			}

	    			dataops.find(db, "player", playerQuery, res, function checkForCoin(thisPlayer){
	    				console.log("Player has " + thisPlayer[0].resources.coin.count + " coin");

	    				if(thisPlayer[0].resources.coin.count >= unitCost[req.body.unit]){

	    					var newUnit = {
	    						type: req.body.unit,
	    						lastUpdated: Date.now(),
	    						owner: thisPlayer[0].name,
	    						job: "none",
	    						jobMessage: "none",
								id: Date.now()
	    					}

	    					var count = "resources.coin.count";

	    					var updatedStats = {}													// decrease how much coin the player has
	    					updatedStats[count] = thisPlayer[0].resources.coin.count-unitCost[req.body.unit];


	    					dataops.update(db, "player", playerQuery, updatedStats, res, false, null, null, function confirmUpdatedCoinCount(updatedPlayer){		// this updates player coin count
	    						console.log("SERVER: Successfully updated player coin count!");

		    						dataops.add(db, "unit", newUnit, res, function createUnitForPlayer(newUnit){		// this creates the new unit
		    							
		    							var unitQuery = {
		    								owner: thisPlayer[0].name,
		    								type: req.body.unit
		    							}

		    							dataops.find(db, "unit", unitQuery, res, function returnNumOfUnits(unitNum){		// this returns how much of that unit the player has
		    								updatedPlayerData = {
				    							message: "success",
				    							unitCount: unitNum.length,
				    							coin: updatedPlayer[0].resources.coin.count
				    						}
				    						res.send(updatedPlayerData)
		    							});
	    						});
	
	    					})
	    				} else {
	    					console.log("SERVER: Not enough coin.");
	    					res.send({message: "error", content: "Not enough coin"});
	    				}
	    			})

	    		
	    	}

	    	if(req.body.action == "assign"){

	    		/*
					1. look up the unit's owner 
					2. check that unit exists
					3. update worker status
	    		*/

	    		var unitQuery = {
	    			id: parseInt(req.body.id)
	    		}

	    		dataops.find(db, "unit", unitQuery, res, function findUnit(unit){
	    			if(unit.length == 1){

	    				var updateQuery = {
	    					jobMessage: jobMessage[req.body.job],
	    					job: req.body.job
	    				}
/*			    		updateQuery["jobMessage"] = req.body.job;
			    		updateQuery["job"] = req.body.job;*/

			    		dataops.update(db, "unit", unitQuery , updateQuery, res, false, null, null, function confirmUpdatedUnit(updatedUnit){
			    			console.log("changed unit's job to " + updatedUnit[0].job);
			    			var response = {
		    					message: "success!",
		    					unit: updatedUnit[0]
		    				}
			    			res.send(response);
			    		});


	    			} else {
	    				console.log("SERVER: this unit is ded.")

	    				var response = {
	    					message: "fail"
	    				}

	    				res.send(response)
	    			}
	    			
	    		});


	    		

	    	}

    	} else {
    		console.log("can't attack - you're not logged in!");
    	}
	});





	/* 404 */

	app.use(function(req, res) {
	    res.status(404);
	    req.session.error = "404 - page not found!";
	    res.redirect("/");
	});

	app.listen(app.get("port"), function() {
	    console.log("Server started on port " + app.get("port"));
	});
});
