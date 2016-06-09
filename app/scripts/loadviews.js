$(document).ready(function(){
  console.log("document ready!");
  $("#header").load("views/header.html"); 
  $("#footer").load("views/footer.html"); 
  $('#welcome').load('views/welcome.html');
  $('#querymodal').load('views/querymodal.html');
    
  $('#inbox').load('views/inbox.html');
    $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
    });
});
