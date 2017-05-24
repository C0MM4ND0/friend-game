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


/* Connecting to the DB */


MongoClient.connect("mongodb://localhost:27017/conquest", function(err, database){
	if (err){
		console.log("MAYDAY! MAYDAY! Crashing.");
		return console.log(err);
	}

	console.log("Got the database!");

	db = database;										// mongo passes us a database, we store its contents in this variable... I think.


/* */

	
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
	    console.log("Request: " + req.method.toUpperCase() + " " + req.url);	
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

	app.get("/", function(req, res){
	    res.render("index");
	});


/* ----------------- AJAX experiments ----------------- */
	app.get("/ajax", function(req, res){
	    res.render("ajax");
	});

	app.post("/ajax", function(req, res){
		console.log("SERVER: request to SAVE data is: " + JSON.stringify(req.body));

	    dataops.add(db, "random", req.body, res, function(){
	    	res.send(req.body);
	    });

	});


	app.post("/ajax-2", function(req, res){
		console.log("SERVER: request to FIND data is: " + JSON.stringify(req.body));	

		if(req.body.item.toLowerCase() == "all"){			// if we send an empty query, let's return everything
			req.body = {};
		}

	    dataops.find(db, "random", req.body, res, function(result){
	    	res.send(result);
	    });

	    // res.send is called straight in the database.js function, right after the data is retrieved
   
	});

/* ----------------- end AJAX experiments ----------------- */
	
	var reg = /^\d+$/;				// not sure why i need this...

	// load a game
	app.get(/^\/game\/(\d+)\/(.+)$/, function(req, res){					// this matches /game/#/username
		
		if(req.session.user && req.session.user.name == req.params[1]){								// only let the player see this page if they're the player
			console.log("this is game " + req.params[0] + ", player " + req.params[1]);
			dataops.find(db, "player", req.body, res, function(all_players){	// get all the players		    
			    var current_player = all_players.filter(function(el){			// filter the current player by ID stored in session
		    		return el._id == req.session.user._id;
		    	})
		    	res.render("game", {player: current_player, opponents: all_players});	
			});
		} else {
			req.session.message = "You need to log in";
			res.redirect("/login");
		}
	});

	app.get("/game", function(req, res){
		var url;
		if(req.session.user){
			url = "/game/" + 1 + "/" + req.session.user.name
		} else {
			url = "/login"
			req.session.message = "You need to log in";	
		}
		res.redirect(url);
	})

	app.get("/newplayer", function(req, res){
		res.render("newplayer", {"session": req.session});
	});


	app.post("/newplayer", function(req, res){
		console.log(req.body);
		if((req.body.name).replace(/\s/g, '').length > 0 && (req.body.capital).replace(/\s/g, '').length > 0){			// let's make sure the input name isn't empty
				
				var new_player = {
					name: req.body.name,
					capital: req.body.capital,
					walls: "wood",
					stats: {
						hp: 100,
						strength: 10,
						walls: "wood",
					},
					units: {
						footmen: 10,
						ft_lvl: 1,
						archers: 5,
						ar_lvl: 1,
						scout: 1
					},
					actions: []
				}

				dataops.addNewPlayer(db, "player", new_player, res, function(result){
				req.session.message = result;
				res.redirect("/login");
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
					console.log("SETTING COOKIE!");
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
		console.log("req.session.expires:");
		console.log(req.session.expires);
		res.send(req.session.expires);
	});

	app.get("/logout", function(req, res){
		req.session.user = null;
		req.session.expires = new Date(Date.now);		/* not sure if this is needed*/
		res.render("index", {error: "Logged out"});
	})


	app.get("/ajax", function(req, res){
	    res.render("ajax");
	});

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

		if(req.body.action == "scout"){

			console.log("got the ajax call...");

			var pl = {
				"name": req.session.user.name
			}
			console.log("pl hp is: " + req.session.user.stats.hp);
			var q = { "stats.hp": (req.session.user.stats.hp + 10)};

			dataops.update(db, "player", pl, q, res, false, null, null, function updateScreen(result){
				console.log("Done updating");	
				req.session.user = result[0];
				res.send(req.session.user);
			});

			//res.end();
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
				action: "attack",
				username: req.session.user.name,
				date: dt,
				weight: req.session.user.stats.strength
			};

			 dataops.update(db, "player", targetPlayer, action, res, true, "actions", "push", function(targetPlayer){
		    	console.log("Target player: ");
		    	console.log(targetPlayer);
		    	res.send("Server: viciously attacked " + req.body.player);
		    });
			
		}

		if(req.body.action == "block"){
			console.log("back end: received block");

			var targetPlayer = {
				name: req.body.player
			}; 
			var action = {
				action: "block",
				username: req.session.user.name,
				date: dt,
				weight: req.session.user.stats.strength
			};

			dataops.update(db, "player", targetPlayer, action, res, true,  "actions", "pull", function(targetPlayer){
		    	console.log("Target player: ");
		    	console.log(targetPlayer);
		    	res.send("Server: viciously attacked " + req.body.player);
	    	});
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
