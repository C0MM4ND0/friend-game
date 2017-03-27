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
	
    $.ajax({
        type: "POST",
        url: "/ajax-2",
        success: function(result){
            console.log(result);
        }
    })

});

