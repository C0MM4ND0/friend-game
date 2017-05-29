$(document).ready(main);

function main(){

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

    $("#block").click(function(){

        console.log("attempting to block attack");

        action = {
            action: "block"
        }

        $.ajax({
            type: "post",
            url: "/game",
            data: action,
            success: function(result){   
                if (result.message != "there's nothing to block!"){
                    $("."+result.date).text("You've successfully blocked this attack")
                    $("."+result.date).append("<br>");
                }
                    console.log(result.message); 
                
            }
        })
    });

    $(".block").click(function(){

        console.log("attempting to block attack");

        action = {
            action: "block-2",
            date: $(this).attr("id")
        }

        $.ajax({
            type: "post",
            url: "/game",
            data: action,
            success: function(result){   
                if (result.message != "there's nothing to block!"){
                    $("."+result.date).text("You've successfully blocked this attack")
                    $("."+result.date).append("<br>");
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

    var attackTime = setInterval(function(){
        console.log("updating attack time");


        $(".action-time-left").each(function(){

            var parent = $(this).parent();
            var assailant = parent.find(".attack-from").text();             // this could also be done with sibling() ?s
            var timeNow = parseInt($(this).text()) + 1;
            var expires = parseInt($(this).next(".action-expires").text());
            console.log(timeNow + "/" + expires)

            if(timeNow <= expires){
                $(this).text(timeNow);
            } else {

                    console.log("getting updated info!");

                    action = {
                        action: "getUpdatedInfo"
                    }

                    $.ajax({                                    // get new player HP from server
                        type: "post",
                        url: "/game",
                        data: action,
                        success: function(result){
                            var damage = parseInt($("#hp").text()) - result.hp
                            parent.text("An attack from " + assailant + " hits you for " + damage + " hp");
                            parent.append("<br>");
                            $("#hp").text(result.hp);
                            $("#hp").addClass("recently-updated ");
                            //$(this).text("You've taken " + result.damage + " damage as a result of an attack from  " + result.opponent);
                        }
                    })            
            }
        });




    }, 1000)
        






}

