function giveRandom(){
    var array = ["oranges", "batman", "granite", "alabama", "roosevelt", "owl", "yoga", "chillout"];
    return array[Math.floor(Math.random()*array.length)];
}


module.exports.giveRandom = giveRandom;