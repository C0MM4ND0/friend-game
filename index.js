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




	app.use(function(req, res, next){                  // logs request URL
	    console.log("Request: " + req.method.toUpperCase() + " " + req.url);
	    next();
	});

	app.get("/", function(req, res){
	    res.render("index");
	});

	app.get("/ajax", function(req, res){
	    res.render("ajax");
	});

	app.post("/ajax", function(req, res){
	    var answer = main.giveRandom();

	    var answerObject = {
	    	item: answer
	    }

	    dataops.add(db, "random", answerObject);

	    res.send(answer);
	});


	app.post("/ajax-2", function(req, res){

		var queryObject = {
	    	item: "oranges"
	    }

	    var answer = dataops.find(db, "random", queryObject);
	    res.send(answer);
	});





	app.use(function(req, res) {
	    res.status(404);
	    res.send("404 - page not found!");
	});

	app.listen(app.get("port"), function() {
	    console.log("Server started on port " + app.get("port"));
	});
});
