function add(db, col, obj, res){

	    db.collection(col).save(obj, function( err, result){
	    	if (err){
				console.log("MAYDAY! MAYDAY! Crashing.");
				return console.log(err);
			}
			console.log("Saved the object to our database!");
			res.send(obj);
	    })
}


function find(db, col, obj, res){

	db.collection(col).find(obj).toArray(function(err, result){
		if (err){
				console.log("MAYDAY! MAYDAY! Crashing.");
				return console.log(err);
			}

			console.log("SERVER: actual db pull: " + JSON.stringify(result));
			res.send(result);
	})

}




module.exports.add = add;
module.exports.find = find;