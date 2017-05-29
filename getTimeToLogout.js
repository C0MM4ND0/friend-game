$(document).ready(main);

function main(){

    var exp;
    var timeLeft;
    var secCounter;

    $.ajax({
        type: "get",
        action: "get",
        url: "/time-to-logout",
        success: function(result){                      
            exp = new Date(result);
            timeLeft = Math.floor((exp - Date.now())/1000);
            var status;
            if(isNaN(timeLeft)){
                status = "Logged out";
            } else {
                status = Math.ceil(timeLeft/60/60) + " hours";
            }

            $("#time-left").text(status);
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
                window.location.reload();                                   // when logged out, force screen refresh
            } 
        } else {
            $("#time-left").text(Math.ceil(secCounter/60/60) + " hours");               // update counter on the page
            secCounter--;                                                               // count down one second
        }

    }, 1000)



}