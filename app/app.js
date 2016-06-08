
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
        gapi.client.load('gmail', 'v1', displayInbox);
      }
      function handleSignOut(){
        //gapi.auth.signOut();      // this method don't work on localhost
        window.location.href = "https://accounts.google.com/logout"; //sign out google account 
      }
      function displayInbox() {
        var request = gapi.client.gmail.users.messages.list({
          'userId': 'me',
          'labelIds': 'INBOX',
          'maxResults': 10
        });

        request.execute(function(response) {
          $.each(response.messages, function() {
            var messageRequest = gapi.client.gmail.users.messages.get({
              'userId': 'me',
              'id': this.id
            });
            messageRequest.execute(appendMessageRow);
          });
        });
      }

      function appendMessageRow(message) {  // add email in home page
        $('.table-inbox tbody').append(
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

        $('body').append(      //add modal to index.html body
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
            
        $('#message-link-'+message.id).on('click', function(){
          var ifrm = $('#message-iframe-'+message.id)[0].contentWindow.document;
          $('body', ifrm).html(getBody(message.payload)); //The html() method sets or returns the content (innerHTML) of the selected elements. in this case, sets the ifrm content using html content.
        });
      }

 function appendMessageRow2(message) {  
         //add table to query_modal
        $('#query_tbody').append(          
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
        //add modal to #pop_up_modal
      $('#pop_up_modal').append(
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
     
        $('#message-link-'+message.id).on('click', function(){
          var ifrm = $('#message-iframe-'+message.id)[0].contentWindow.document;
          $('body', ifrm).html(getBody(message.payload));
        });
      }
    
      function getHeader(headers, index) {
        var header = '';
        $.each(headers, function(key,value){ // headers is an obj array, just use key,value, key=index, value=obj
            console.log(key+" message.headers.name: "+this.name+"  Value:"+this.value);
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

function listMessages(userId, query, callback) {
  var getPageOfMessages = function(request, result) {
    request.execute(function(resp) {
      result = result.concat(resp.messages);
      var nextPageToken = resp.nextPageToken;
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

    function listMessages2(query_input){
        $("#query_tbody").empty();      // query modal for list header information
        $('#pop_up_modal').empty();            // query modal for display content //care!! add this could decrease memory
        listMessages("me",query_input,function(result){
        for(var i=0;i<result.length;++i){
          console.log(result[i].id);
        }
         $.each(result, function() { //对于每一个message遍历
            var messageRequest = gapi.client.gmail.users.messages.get({
              'userId': 'me',    //userId 可以用邮箱
              'id': this.id     // this 指的每一个message，它都有一个id属性
            });
            messageRequest.execute(appendMessageRow2);
          });
        })};
        //listMessages("me","wix",function(){console.log("hehe")})

      function handleAuthResult(authResult) {
        if(authResult && !authResult.error) {
          loadGmailApi();                               //email page
          $('#authorize-button').addClass("hidden");
          $('#testmodal-button').removeClass("hidden");
          $('#signout-button').removeClass("hidden");
          $('.table-inbox').removeClass("hidden");
          $('#signout-button').on('click', function(){
            handleSignOut();
          });
          $('#search_button').on('click',function(){
              var query_input = $('#query_input').val();
              if(query_input=='') {
                alert("Enter Some Text In Input Field");
                }else{
                //alert(query_input);
                $("#query_modal").modal();
                listMessages2(query_input);
                };
          });
        } else {
          $('#authorize-button').removeClass("hidden"); //signin page
          $('#authorize-button').on('click', function(){
            handleAuthClick();
          });
        }
      }