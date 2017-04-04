var counter = 1;

console.log("hello world!");


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

