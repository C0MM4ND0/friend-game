function add(db, col, obj, res, callback){

	    db.collection(col).save(obj, function(err, result){
	    	if (err){
				console.log("MAYDAY! MAYDAY! Crashing.");
				return console.log(err);
			}
			console.log("Saved the object to our database!");
			callback();
	    })
}


function find(db, col, obj, res, callback){

	db.collection(col).find(obj).toArray(function(err, result){
		if (err){
				console.log("MAYDAY! MAYDAY! Crashing.");
				return console.log(err);
			}
			console.log("FIND search query:");
			console.log(obj);
			console.log("SERVER: actual db pull: " + JSON.stringify(result));
			callback(result);
	})

}

function findAction(db, col, obj, res, callback){

	db.collection(col).find(obj).sort({date: 1}).toArray(function(err, result){
		if (err){
			console.log("MAYDAY! MAYDAY! Crashing.");
			return console.log(err);
		}
		console.log("FIND search query:");
		console.log(obj);
		console.log("SERVER: actual db pull: " + JSON.stringify(result));
		callback(result);
	})

}

function addNewPlayer(db, col, player, res, callback){
	
	db.collection(col).count({"name": player.name}, function checkIfExists(err, result){
		if (err){
			console.log("MAYDAY! MAYDAY! Crashing.");
			return console.log(err);
		}

		console.log("players in the database: " + JSON.stringify(result));

		if (result > 0){
			console.log("this player already exists");
			callback("this player already exists");
		} else {
			db.collection(col).save(player, function savePlayer(err, result) {
				if (err){
					console.log("MAYDAY! MAYDAY! Crashing.");
					return console.log(err);
				}
				callback("New player successfully created");
			});
		}
		
	});
}

function deletePlayer(db, col, player, res, callback){
	
	db.collection(col).count({"name": player.name}, function checkIfExists(err, result){
		if (err){
			console.log("MAYDAY! MAYDAY! Crashing.");
			return console.log(err);
		}

		console.log("players in the database: " + JSON.stringify(result));

		if (result < 1){
			console.log("no such player exists");
			callback("no such player exists");
		} else {
			console.log("deleting player");
			db.collection(col).remove({name: player.name}, function removePlayer(err, result) {
				if (err){
					console.log("MAYDAY! MAYDAY! Crashing.");
					return console.log(err);
				}
				callback(player.name + " successfully deleted");
			});
		}
		
	});
}

function remove(db, col, query, res, callback){
	
		db.collection(col).remove(query, function removeThis(err, result) {
			if (err){
				console.log("MAYDAY! MAYDAY! Crashing.");
				return console.log(err);
			}
			callback("Database: Record successfully deleted");
		});
};

function update(db, col, item, query, res, isArray, array, arrayAction, callback){
	console.log("starting update in DB...");
	console.log("item is: ");
	console.log(item);
	console.log("query is: ");
	console.log(query);
	console.log("array is is: ");
	console.log(array);

	if(isArray){

		if(arrayAction == "push"){
			console.log("pushing to actions array");
			db.collection(col).update(item, {$push: {"actions": JSON.parse(JSON.stringify(query))} }, function displayAfterUpdating(){
				console.log("Updated successfully! New player stats: ");
				find(db, col, {"name": item.name}, res, callback);
			});
		}

		if(arrayAction == "pull"){
			console.log("pulling from actions array");
			db.collection(col).update(item, {$pull: {"actions": JSON.parse(JSON.stringify(query))} }, function displayAfterUpdating(){
				console.log("Updated successfully! New player stats: ");
				find(db, col, {"name": item.name}, res, callback);
			});
		}
		
	} else {
		db.collection(col).update(item, {$set: query}, function displayAfterUpdating(){
			console.log("Updated successfully! New player stats: ");
			find(db, col, {"name": item.name}, res, callback);
		});
	}
}





module.exports.add = add;
module.exports.find = find;
module.exports.findAction = findAction;
module.exports.update = update;
module.exports.addNewPlayer = addNewPlayer;
module.exports.deletePlayer = deletePlayer;
module.exports.remove = remove;



