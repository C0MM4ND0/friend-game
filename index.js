/* dependencies */
const http = require("http");
const fs = require("fs");                               // file system
const path = require("path");                           // access paths
const express = require("express");                     // express
const MongoClient = require('mongodb').MongoClient;     // talk to mongo
const bodyParser = require('body-parser');              // parse request body
var session = require('express-session')				// create sessions
var db;													// placeholder for our database
var sess;												// placeholder for our session


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
	    console.log("Session is: ");
	    console.log(req.session);
	    next();
	});

/* ----------------- explore further ---------------------- */

/*	app.use(function(req, res, next) {											// makes messages available to views
	 	res.locals.messages = req.session.messages;
	 	next();
	})*/

/* ----------------- -------------- ---------------------- */

	app.get("/", function(req, res){
	    res.render("index", {session: req.session});
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
	
	var reg = /^\d+$/;

	// load a game
	app.get(/^\/game\/(\d+)\/(.+)$/, function(req, res){
		if(req.session.user){
			console.log("this is game " + req.params[0] + ", player " + req.params[1]);
			dataops.find(db, "player", {name: req.params[1]}, res, function displayPlayer(result){
				console.log(result.length);
				if(result.length > 0){
					res.render("game", {player: result});
				} else {
					res.send("that's not a real player");
				}
			});
		} else {
			res.redirect("/login");
		}
	});

	app.get("/newplayer", function(req, res){
		res.render("newplayer", {"session": req.session});
	});


	app.post("/newplayer", function(req, res){
		console.log(req.body);
		if((req.body.name).replace(/\s/g, '').length > 0 && (req.body.capital).replace(/\s/g, '').length > 0){			// let's make sure the input name isn't empty
				dataops.addNewPlayer(db, "player", req.body, res, function(result){
				res.redirect("/allplayers");
			});
		} else {
			res.send("cannot save player with no name or capital");
		}
		
	});

	app.get("/login", function(req, res){
		res.render("login", {session: req.session});
	});

	app.post("/login", function(req, res){
		console.log(req.body);
		if((req.body.name).replace(/\s/g, '').length >0){
			dataops.find(db, "player", {name: req.body.name}, res, function displayPlayer(result){
				if(result.length > 0){
					console.log("SETTING COOKIE!");
					req.session.user = result[0].name;
					req.session.expires = new Date(Date.now() + 10000);		// this helps the session keep track of the expire date
					req.session.cookie.maxAge = 10000;						// this is what makes the cookie expire
					console.log("The cookie set is: ");
					console.log(req.session.cookie);
					res.redirect("/");
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
		res.render("index", {session: req.session, error: "Logged out"});
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

	app.use(function(req, res) {
	    res.status(404);
	    res.send("404 - page not found!");
	});

	app.listen(app.get("port"), function() {
	    console.log("Server started on port " + app.get("port"));
	});
});
