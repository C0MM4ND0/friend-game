/* dependencies */
const http = require("http");
const fs = require("fs");                               // file system
const path = require("path");                           // access paths
const express = require("express");                     // express
const MongoClient = require('mongodb').MongoClient      // talk to mongo
const bodyParser = require('body-parser')               // parse request body
// const cookieParser = require('cookie-parser');        // allows us to read cookies
var db;													// placeholder for our database - not sure why yet

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
	

	app.use(function(req, res, next){                  							// logs request URL
	    console.log("Request: " + req.method.toUpperCase() + " " + req.url);
	    next();
	});


	
	app.use(bodyParser.urlencoded({
	    extended: true
	}));

	app.use(bodyParser.json()); 						// for parsing application/json

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


	app.get("/game/:id", function(req, res){
		
		console.log("hey!");
		console.log("Fetching game " + req.params.id);

		// we need to check if a player with this ID exsits. If true, fetch all of that player's info. 
		// If false, redirect to create new player page


		res.send("this is game " + req.params.id);
	});

	app.get("/newplayer", function(req, res){
		
		res.render("newplayer");
	});


	app.post("/newplayer", function(req, res){
		console.log(req.body);
		dataops.addNewPlayer(db, "player", req.body, res, function(result){
			res.send(result);
		});
	});


	app.get("/np", function(req, res){

		var player = {
			name: "test",
			capital: "test-town"
		}

		dataops.addNewPlayer(db, "player", player, res, function(result){
			res.send(result);	
		});
	    
	});

	app.get("/ajax", function(req, res){
	    res.render("ajax");
	});

	app.use(function(req, res) {
	    res.status(404);
	    res.send("404 - page not found!");
	});

	app.listen(app.get("port"), function() {
	    console.log("Server started on port " + app.get("port"));
	});
});
