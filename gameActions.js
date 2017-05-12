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
                console.log("scouted");
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
    

    


}