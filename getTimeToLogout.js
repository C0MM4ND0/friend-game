$(document).ready(main);

function main(){



    setInterval(function(){
        $.ajax({
                type: "get",
                action: "get",
                url: "/time-to-logout",
                success: function(result){                      // when logged out, force screen refresh


                    exp = new Date(result);
                    var timeLeft = Math.floor((exp - Date.now())/1000);
                    console.log("got result: " + timeLeft);

                    if(isNaN(timeLeft)){
                        timeLeft = "Logged out";

                        if($("#time-left").text() != "Logged out"){
                            console.log("reloading!");
                            window.location.reload();
                        }
                    }

                    $("#time-left").text(timeLeft);


                }
            })

    }, 1000)

}