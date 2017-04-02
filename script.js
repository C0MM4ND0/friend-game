console.log("hello world!");


$("#adder").click(function(){

    itemToSend = {
        item: $("#item").val()
    }

    console.log("CLIENT: sending to server to SAVE..." + JSON.stringify(itemToSend));

    $.ajax({
        type: "POST",
        url: "/ajax",
        data: itemToSend,
        success: function(result){
            $(".result").text("Saved " +  itemToSend.item)
        }
    })

});


$("#finder").click(function(){
	
    itemToSend = {
        item: $("#item").val()
    }

    console.log("CLIENT: sending to server to FIND..." + JSON.stringify(itemToSend));

    $.ajax({
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        url: "/ajax-2",
        data: JSON.stringify(itemToSend),

        success: function(result){
            console.log("CLIENT: Received a response from the server.");
            console.log(JSON.stringify(result));
            $(".result").text(result.length + " results found for search: " + itemToSend.item)
        }
    })

});

