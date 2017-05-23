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
    

    $(".action").click(function(){
        console.log("front end: attacking!");
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
                console.log(result);

            }
        })
    });

}