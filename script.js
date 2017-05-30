$(document).ready(main);

function main(){

    var counter = 1;

    console.log("script.js loaded");


    $("#adder").click(function(){

        itemToSend = {
            item: $("#item").val()
        }

        console.log("CLIENT: sending to server to SAVE..." + JSON.stringify(itemToSend));

        if((itemToSend.item).replace(/\s/g, '').length > 0){
            $.ajax({
                type: "POST",
                url: "/ajax",
                data: itemToSend,
                success: function(result){
                    $(".result").html("Saved <span class = 'query'>" +  itemToSend.item + "</span>")
                }
            })
        } else {
            $(".result").html("Cannot save empty item.");
        }
    });


    $("#finder").click(function(){
        
        itemToSend = {
            item: $("#item").val()
        }

        console.log("CLIENT: sending to server to FIND..." + JSON.stringify(itemToSend));

        if((itemToSend.item).replace(/\s/g, '').length > 0){
            $.ajax({
                type: "POST",
                contentType: "application/json",
                dataType: "json",
                url: "/ajax-2",
                data: JSON.stringify(itemToSend),

                success: function(result){
                    console.log("CLIENT: Received a response from the server.");
                    console.log(JSON.stringify(result));
                    $(".result").html(result.length + " results found for search: <span class = 'query'>" + itemToSend.item + "</span>");
                    $(".items").append("<div>" + counter + ". " + JSON.stringify(result) + "<br></div>");
                    counter++;
                }
            })
        } else {
            $(".result").html("Cannot search for empty item.");
        }items
    });

    // gray out /newplayer submit button unless both fields have something in them.

    $("#new-player-submit").prop('disabled',true);

    $("#player-capital, #player-name").keyup(function(){
        if($("#player-name").val().length > 0 && $("#player-capital").val().length > 0){
            $("#new-player-submit").prop('disabled',false); 
        } else {
            $("#new-player-submit").prop('disabled',true); 
        }


    });


    // delete on click

    $(".pl-name").click(function(){

        var player = $(this).attr("id");

        console.log("you clicked on a player named: " + player);

        if(confirm("Are you sure you want to delete " + player + " from the database?")){
            playerToDelete = {
                name: player
            }

            $.ajax({
                type: "DELETE",
                action: "DELETE",
                url: "/allplayers",
                data: playerToDelete,
                success: function(result){
                    console.log(result);
                    $("#" + player).closest(".player-info").remove();
                }
            })
        } else {
            alert("You saved a life today, you champ.");
        }
    });

}




