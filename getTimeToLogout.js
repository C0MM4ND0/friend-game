$(document).ready(main);

function main(){

    var exp;
    var timeLeft;
    var secCounter;


    $.ajax({
        type: "get",
        action: "get",
        url: "/time-to-logout",
        success: function(result){                      // when logged out, force screen refresh
            exp = new Date(result);
            timeLeft = Math.floor((exp - Date.now())/1000);
            secCounter = timeLeft;
        }
    })


    var timer = setInterval(function(){ 
        console.log("tick");
        if(secCounter < 1 || isNaN(secCounter)){                             // if we're logging out, stop counting
            console.log("clearing timer!");
            clearInterval(timer);
            if($("#time-left").text() != "Logged out"){
                console.log("reloading!");
                window.location.reload();
            } 
        } else {
            $("#time-left").text(secCounter);               // update counter on the page
            secCounter--;                                   // count down one second
        }

    }, 1000)



}