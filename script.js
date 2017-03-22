console.log("hello world!");


$("#adder").click(function(){

    $.ajax({
        type: "POST",
        url: "/",
        success: function(result){
            $(".items").append(result + "<br>");
        }
    })

});

