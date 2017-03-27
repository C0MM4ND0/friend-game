function add(db, collection, obj){

	    db.collection(collection).save(obj, function( err, result){
	    	if (err){
				console.log("MAYDAY! MAYDAY! Crashing.");
				return console.log(err);
			}
			console.log("Saved the object to our database!");
	    })
}


function find(db, col, obj){

	db.collection(col).find(obj).toArray(function(err, result){
		if (err){
				console.log("MAYDAY! MAYDAY! Crashing.");
				return console.log(err);
			}

			console.log(result);
	})

}




module.exports.add = add;
module.exports.find = find;