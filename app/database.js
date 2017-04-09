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
				callback(result.ops[0]);
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



module.exports.add = add;
module.exports.find = find;
module.exports.addNewPlayer = addNewPlayer;
module.exports.deletePlayer = deletePlayer;



