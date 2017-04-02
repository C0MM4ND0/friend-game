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




module.exports.add = add;
module.exports.find = find;