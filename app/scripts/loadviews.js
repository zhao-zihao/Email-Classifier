$(document).ready(function(){
  console.log("document ready!");
  $("#header").load("views/header.html"); 
  //$("#footer").load("views/footer.html");
  $('#welcome').load('views/welcome.html');
  $('#inbox').load('views/inbox.html');
  $('#personal').load('views/personal.html'); 
  $('#stevens').load('views/stevens.html');
  $('#querymodal').load('views/querymodal.html');
  $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled").promise().done(function(){
            console.log("toggled wraper");
        }) // from remove to add OR from add to remove this toggled class
  });
  // console.log($('#welcome-footer'));
});
