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

