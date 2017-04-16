$(document).ready(main);

function main(){



    setInterval(function(){
        $.ajax({
                type: "get",
                action: "get",
                url: "/time-to-logout",
                success: function(result){


                    exp = new Date(result);
                    var timeLeft = Math.floor((exp - Date.now())/1000);
                    console.log("got result: " + timeLeft);
/*
                    if(timeLeft < 0){
                        timeLeft = "Logged out";
                        console.log("is: " + $("#time-left").text())
                        if($("#time-left").text() != "Logged out"){
                            console.log("reloading!");
                            loggedIn = false;
                            // window.location.reload();
                        }
                    } 
*/

                    if(timeLeft > -1){
                        $("#time-left").text(timeLeft);
                    } else {
                        $("#time-left").text("Logged Out");
                    }
                    
                }
            })

    }, 1000)

}