var sec = 1;
var a;

function fetch(callback){
	a = setInterval(function(){
		console.log("second " + sec);
		sec++
	}, 100)

	setTimeout(function(){
		console.log("five seconds have passed");
		callback();
	}, 5000)
}


function confirm(){
	console.log("And we're done.");
	clearInterval(a);
}



console.log("this comes first");
fetch(confirm);
console.log("this comes second");
