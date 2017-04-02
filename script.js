console.log("hello world!");


$("#adder").click(function(){

    $.ajax({
        type: "POST",
        url: "/ajax",
        success: function(result){
            $(".items").append(result + "<br>");
        }
    })

});


$("#finder").click(function(){
	
    sample = {
        item: $("#item-type").val()
    }

    console.log("CLIENT: sending to server..." + JSON.stringify(sample));

    $.ajax({
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        url: "/ajax-2",
        data: JSON.stringify(sample),

        success: function(result){
            console.log("CLIENT: Received a response from the server.");
            console.log(JSON.stringify(result));
            $(".result").text(result.length + " results found for search: " + sample.item)
        }
    })

});

