$(document).ready(main);

function main(){

    fetchActions();

    console.log("ready!");

    $("#scout").click(function(){

        action = {
            action: "scout",
        }

        $.ajax({
            type: "post",
            url: "/game",
            data: action,
            success: function(result){                      
                console.log("scouted. HP is now " + result.stats.hp);
                $("#hp").text(result.stats.hp);
            }
        })
    });


    $("#build").click(function(){

        action = {
            action: "build"
        }

        $.ajax({
            type: "post",
            url: "/game",
            data: action,
            success: function(result){                      
                console.log(result); 
            }
        })
    });

    $("#block-auto").click(function(){

        console.log("attempting to block attack");

        action = {
            action: "block-auto"
        }

        $.ajax({
            type: "post",
            url: "/game",
            data: action,
            success: function(result){   
                if (result.message != "there's nothing to block!"){
                    $("#"+result.date).text("You've successfully blocked this attack")
                    $("#"+result.date).append("<br>");
                    $("#"+result.date).removeClass("active-action");
                    $("#"+result.date).next(".single-block-div").hide();
                }
                
                console.log(result.message); 
                
            }
        })
    });

    $(".block-single-attack").click(function(){

        console.log("attempting to block attack");

        action = {
            action: "block-single-attack",
            date: $(this).attr("id")
        }

        $.ajax({
            type: "post",
            url: "/game",
            data: action,
            success: function(result){   
                if (result.message != "there's nothing to block!"){
                    $("#"+result.date).text("You've successfully blocked this attack")
                    $("#"+result.date).append("<br>");
                    $("#"+result.date).removeClass("active-action");
                    $("#"+result.date).next(".single-block-div").hide();
                }
                
                console.log(result.message); 
                
            }
        })
    });
    

    $(".action").click(function(){
        console.log("front end: attacking!");
        var clicked = $(this);
        var name = $(this).attr("data-name");
        var move = $(this).attr("data-action");

        action = {
            action: move,
            player: name
        }

        $.ajax({
            type: "post",
            url: "/game",
            data: action,
            success: function(result){
                clicked.parents("."+name).find(".action-count").append(" x ");
                console.log(result);
                
            }
        })
    });


    /* Keep track of how much time is left to block */

    function fetchActions(){

        // keep track of all the actions against the logged in player

        action = {
            action: "fetchActions"
        }

        $.ajax({                                    
            type: "post",
            url: "/game",
            data: action,
            success: function(result){
                placeActionsOnPage(result);
            }
        }) 

    }

    function placeActionsOnPage(result){
                if(result.message != "fail"){

                    result.data.forEach(function(action){

                        /* set how much time is left */

                        var thisAction = $("#" + action.date);
                        var msLeft = action.date + action.expires - Date.now();
                        var minsLeft = Math.floor((msLeft/1000)/60);
                        var secsLeft = Math.floor(msLeft/1000) - (minsLeft*60);

                        if(secsLeft.toString().length == 1){
                            secsLeft = "0" + secsLeft;
                        }

                        thisAction.children(".name").text(action.from);
                        thisAction.children(".weight").text(action.data.weight);
                        thisAction.children(".mins-left").text(minsLeft);
                        thisAction.children(".secs-left").text(secsLeft);


                        /* set countdown */

                        function countDownSecond(){
                            if(thisAction.hasClass("active-action")){

                                var secondsLeft = parseInt(thisAction.children(".secs-left").text());
                                var minutesLeft = parseInt(thisAction.children(".mins-left").text());

                                secondsLeft--;
                                
                                if(secondsLeft < 0){
                                    secondsLeft = 59;
                                    minutesLeft--;
                                }

                                if(secondsLeft.toString().length == 1){
                                    secondsLeft = "0" + secondsLeft;
                                }

                                thisAction.children(".secs-left").text(secondsLeft);
                                thisAction.children(".mins-left").text(minutesLeft);
                            } else {
                                clearInterval(ticker);
                                clearTimeout(expire);
                            }
                        }


                        var ticker = setInterval(countDownSecond, 1000);


                        /* set expiration timer */

                        var expire = setTimeout(function(){
                            if(thisAction.hasClass("active-action")){
                                thisAction.text(action.from + " hit you for " + action.data.weight).css("color", "red");
                                thisAction.removeClass("active-action");
                                thisAction.next(".single-block-div").hide();
    
                                var newHP = parseInt($("#hp").text()) - action.data.weight;
                                $("#hp").text(newHP).css("color", "red");
                                
    
                                clearInterval(ticker);
                            }

                        }, msLeft)

                    })


                } else {
                    console.log(result.data);
                }
                
            }

}

