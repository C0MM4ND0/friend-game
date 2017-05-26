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



}

