
      var clientId = '361872865320-e60c6te60kiai7ie0ppvo165doqmuc41.apps.googleusercontent.com';
      var apiKey = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
      var scopes = 'https://www.googleapis.com/auth/gmail.readonly';

      function handleClientLoad() {
        //gapi.client.setApiKey(apiKey);
        window.setTimeout(checkAuth, 1);
      }

      function checkAuth() {
        gapi.auth.authorize({
          client_id: clientId,
          scope: scopes,
          immediate: true
        }, handleAuthResult);
      }

      function handleAuthClick() {
        gapi.auth.authorize({
          client_id: clientId,
          scope: scopes,
          immediate: false
        }, handleAuthResult);
        return false;
      }

      //load gmail api
      function loadGmailApi() {
        gapi.client.load('gmail', 'v1', loadEmails);
      }
      function handleSignOut(){
        //gapi.auth.signOut();      // this method don't work on localhost
        window.location.href = "https://accounts.google.com/logout"; //sign out google account 
      }
      function loadEmails(){
          listLabels();
          displayInbox();
          displayPersonal();
          displayStevens("Stevens Announcement");
      }
    /**
       * Print all Labels in the authorized user's inbox. If no labels
       * are found an appropriate message is printed.
       */
      function listLabels() {
        var request = gapi.client.gmail.users.labels.list({
          'userId': 'me'
        });

        request.execute(function(resp) {
          var labels = resp.labels;
          console.log('Labels:');

          if (labels && labels.length > 0) {
            for (i = 0; i < labels.length; i++) {
              var label = labels[i];
              console.log(label.name)
            }
          } else {
            console.log('No Labels found.');
          }
        });
      }

      function displayInbox() {
        $('#inbox-button').trigger('click');
        var request = gapi.client.gmail.users.messages.list({
          'userId': 'me',
          'labelIds': 'INBOX',
          'maxResults': 5
        });

        request.execute(function(response) {
            console.log(gapi.client.gmail.users.messages);
          $.each(response.messages, function() {
            var messageRequest = gapi.client.gmail.users.messages.get({
              'userId': 'me',
              'id': this.id
            });
            
            messageRequest.execute(appendMessageRowInbox);
          });
        });
      }
    function displayPersonal() {
        var request = gapi.client.gmail.users.messages.list({
          'userId': 'me',
          'labelIds': 'CATEGORY_PERSONAL',
          'maxResults': 3
        });
        request.execute(function(response) {
          $.each(response.messages, function() {
            var messageRequest = gapi.client.gmail.users.messages.get({
              'userId': 'me',
              'id': this.id
            });
            messageRequest.execute(appendMessageRowPersonal);
          });
        });
      }
    function displayStevens(query_input){
        if(query_input===undefined)
        query_input="Google";
        console.log("display stevens function works!");
        listMessages("me",query_input,function(result){
         $.each(result, function() { 
            var messageRequest = gapi.client.gmail.users.messages.get({
              'userId': 'me',    
              'id': this.id     
            });
            messageRequest.execute(appendMessageRowStevens);
          });
        })};

   function listQuery(query_input){
        $("#query_tbody").empty();      // query modal for list header information
        $('#pop_up_modal').empty();            // query modal for display content //care!! add this could decrease memory
        listMessages("me",query_input,function(result){
         $.each(result, function() { 
            var messageRequest = gapi.client.gmail.users.messages.get({
              'userId': 'me',    
              'id': this.id     
            });
            messageRequest.execute(appendMessageRowQuery);
          });
        })};

function listMessages(userId, query, callback) {
  var getPageOfMessages = function(request, result) {
    request.execute(function(resp) {
      result = result.concat(resp.messages);
      var nextPageToken = resp.nextPageToken;
       console.log("pageToken: "+nextPageToken);
      if (nextPageToken) {
        request = gapi.client.gmail.users.messages.list({
          'userId': userId,
          'pageToken': nextPageToken,
          'q': query
        });
        getPageOfMessages(request, result);
      } else {
        callback(result);
      }
    });
  };
  var initialRequest = gapi.client.gmail.users.messages.list({
    'userId': userId,
    'q': query
  });
  getPageOfMessages(initialRequest, []);
};

 function appendMessageRowInbox(message) {  // add email in home page
        appendHeaderToBody(message,'#inbox-table');
        //console.log("append header row in inbox html.body!");
        appendModalToBody(message);
            
        $('#message-link-'+message.id).on('click', function(){
          var ifrm = $('#message-iframe-'+message.id)[0].contentWindow.document;
          $('body', ifrm).html(getBody(message.payload)); //The html() method sets or returns the content (innerHTML) of the selected elements. in this case, sets the ifrm content using html content.
        });
      }

function appendMessageRowPersonal(message) {  // add email in home page
        appendHeaderToBody(message,'#personal-table');
        console.log("append personal modal to html.body");
        appendModalToBody(message);
        $('#message-link-'+message.id).on('click', function(){
          var ifrm = $('#message-iframe-'+message.id)[0].contentWindow.document;
          $('body', ifrm).html(getBody(message.payload)); 
            console.log("messges link clicked!")
        });
      }
 function appendMessageRowStevens(message){
        appendHeaderToBody(message,'#stevens-table');
        //console.log("append stevens modal to html.body");
        appendModalToBody(message,'#stevens-modal');
        $('#message-link-'+message.id).on('click', function(){
          var ifrm = $('#message-iframe-'+message.id)[0].contentWindow.document;
          $('body', ifrm).html(getBody(message.payload)); //The html() method sets or returns the content (innerHTML) of the selected elements. in this case, sets the ifrm content using html content.
            //console.log("messges link clicked!")
        });
 }
 function appendMessageRowQuery(message) {  
         //add table to query_modal
        appendHeaderToBody(message,'#query_tbody');
        //add modal to #pop_up_modal
        appendModalToBody(message,'#pop_up_modal');
        $('#message-link-'+message.id).on('click', function(){
          var ifrm = $('#message-iframe-'+message.id)[0].contentWindow.document;
          $('body', ifrm).html(getBody(message.payload));
        });
      }

    function appendHeaderToBody(message,target){
        if(target===undefined) target='#inbox-table';
        //console.log(message);
        $(target).append(
          '<tr>\
            <td>'+getHeader(message.payload.headers, 'From')+'</td>\
            <td>\
              <a href="#message-modal-' + message.id +
                '" data-toggle="modal" id="message-link-' + message.id+'">' +
                getHeader(message.payload.headers, 'Subject') +
              '</a>\
            </td>\
            <td>'+getHeader(message.payload.headers, 'Date')+'</td>\
          </tr>'
        );
    }

    function appendModalToBody(message,target){
        
    if(target===undefined) target="body";
    if(target==='#stevens-modal') console.log("stevens works");   
    $(target).append(      //add modal to index.html body
          '<div class="modal fade" id="message-modal-' + message.id +
              '" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">\
            <div class="modal-dialog modal-lg">\
              <div class="modal-content">\
                <div class="modal-header">\
                  <button type="button"\
                          class="close"\
                          data-dismiss="modal"\
                          aria-label="Close">\
                    <span aria-hidden="true">&times;</span></button>\
                  <h4 class="modal-title" id="myModalLabel">' +
                    getHeader(message.payload.headers, 'Subject') +
                  '</h4>\
                </div>\
                <div class="modal-body">\
                  <iframe id="message-iframe-'+message.id+'" srcdoc="<p>Loading...</p>">\
                  </iframe>\
                </div>\
              </div>\
            </div>\
          </div>'
        );
    }
      function getHeader(headers, index) {
        var header = '';
        $.each(headers, function(key,value){ // headers is an obj array, just use key,value, key=index, value=obj
          // console.log(key+" message.headers.name: "+this.name+"  Value:"+this.value);
          if(this.name === index){
            header = this.value;
          }
        });
        return header;
      }

      function getBody(message) { //message = message.payload
        var encodedBody = '';
        if(typeof message.parts === 'undefined')
        {
          encodedBody = message.body.data;
        }
        else
        {
          encodedBody = getHTMLPart(message.parts);
        }
        encodedBody = encodedBody.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
        return decodeURIComponent(escape(window.atob(encodedBody)));
      }

      function getHTMLPart(arr) {
        for(var x = 0; x <= arr.length; x++)
        {
          if(typeof arr[x].parts === 'undefined')
          {
            if(arr[x].mimeType === 'text/html')
            {
              return arr[x].body.data;
            }
          }
          else
          {
            return getHTMLPart(arr[x].parts);
          }
        }
        return '';
      }

      function handleAuthResult(authResult) {
        if(authResult && !authResult.error) {
          loadGmailApi();                               //email page
          $('#authorize-button').addClass("hidden");
          $('#signout-button').removeClass("hidden");
          $('#inbox').removeClass("hidden");
          $('#signout-button').on('click', function(){
            handleSignOut();
          });   
          $('#nav_search').removeClass("hidden");
          $('#welcome').addClass('hidden');
          $('#sidebar-wrapper').removeClass('hidden');
          $('#menu-toggle').removeClass('hidden');
          $('#footer').empty();
          $('#search_button').on('click',function(){
              var query_input = $('#query_input').val();
              if(query_input=='') {
                alert("Enter Some Text In Input Field");
                }else{
                $("#query_modal").modal();
                listQuery(query_input);
                };
          });
          $('#inbox-button').addClass("sidebar-active");
          $('#inbox-button').on('click',function(){
              
              $('#mailcontent .emails').addClass('hidden');
              $('#inbox').removeClass('hidden');
              $('.sidebar-nav a').removeClass("sidebar-active");
              $('#inbox-button').addClass("sidebar-active");
              console.log("inbox-button click!")
          });
          $('#personal-button').on('click',function(){
              $('#mailcontent .emails').addClass('hidden');
              $('#personal').removeClass('hidden');
              $('.sidebar-nav a').removeClass("sidebar-active");
              $('#personal-button').addClass("sidebar-active");
               console.log("personal-button click!")
          });
            $('#stevens-button').on('click',function(){
              $('#mailcontent .emails').addClass('hidden');
              $('#stevens').removeClass('hidden');
              $('.sidebar-nav a').removeClass("sidebar-active");
              $('#stevens-button').addClass("sidebar-active");
               console.log("stevens-button click!")
          });  
        } else {
          $('#mailcontent .emails').addClass('hidden');
          $('#menu-toggle').addClass('hidden');
          $('#sidebar-wrapper').addClass('hidden');
          $('#nav_search').addClass("hidden");
          $('#welcome').removeClass('hidden');
          $('#authorize-button').removeClass("hidden"); //signin page
          $('#authorize-button').on('click', function(){
            handleAuthClick();
          });
        }
      }
