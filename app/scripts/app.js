
      var clientId = '361872865320-e60c6te60kiai7ie0ppvo165doqmuc41.apps.googleusercontent.com';
      //var apiKey = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
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
        gapi.client.load('gmail', 'v1').then(loadEmails);
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
        var message_ids=[];
        var message_ids_unread=[];
        var message_ids_read=[];
        var message_ids_dlete=[];
        gapi.client.gmail.users.messages.list({
          'userId': 'me',
          'labelIds': 'INBOX',
          'maxResults': 30
        }).then(function(resp){
            //console.log(resp);
            //console.log("gapi.client.gmail.users.messages: ");
            //console.log(gapi.client.gmail.users.messages);
          $.each(resp.result.messages, function() {
              //send request to gapi server for a specific message
            gapi.client.gmail.users.messages.get({
              'userId': 'me',
              'id': this.id
            }).then(function(resp){
             // promise reference: https://developers.google.com/api-client-library/javascript/features/promises#using-promises
               //console.log(resp);
               //console.log(resp.result);
               appendMessageRowInbox(resp.result,'#inbox-table','inbox-all');
               message_ids.push(resp.result.id);
               if(resp.result.labelIds.indexOf('UNREAD')===-1){
                    //inbox-table-read
                    message_ids_read.push(resp.result.id);
                    appendMessageRowInbox(resp.result,'#inbox-table-read','inbox-read');
               }else{
                    //inbox-table-unread
                   message_ids_unread.push(resp.result.id);       
                   appendMessageRowInbox(resp.result,'#inbox-table-unread','inbox-unread');
               }
            });
          });
        }); // end gapi
        //#inbox-select function
        function select_function(diff_box,selector_all,selector_none,id_array=[]){
            $(selector_all).on('click',function(){
             $.each(id_array,function(){
                 $("#"+diff_box+"check-"+this).prop('checked', true);
             });
            });
            $(selector_none).on('click',function(){
                 $.each(id_array,function(){
                     $("#"+diff_box+"check-"+this).prop('checked', false);
                 });
            });
        };
        select_function('inbox-all','#inbox-select-all-all','#inbox-select-all-none',message_ids); 
        select_function('inbox-unread','#inbox-select-unread-all','#inbox-select-unread-none',message_ids_unread); 
        select_function('inbox-read','#inbox-select-read-all','#inbox-select-read-none',message_ids_read); 
      }
    function displayPersonal() {
        var request = gapi.client.gmail.users.messages.list({
          'userId': 'me',
          'labelIds': 'CATEGORY_PERSONAL',
          'maxResults': 20
        });
        request.execute(function(response) {
          $.each(response.messages, function() {
            gapi.client.gmail.users.messages.get({
              'userId': 'me',
              'id': this.id
            }).then(function(resp){
                appendMessageRowPersonal(resp.result);
            });
          });
        });
      }
    function displayStevens(query_input){
        if(query_input===undefined)
          query_input="Google";
        console.log("display stevens function works!");
        listMessages("me",query_input,function(result){
          console.log(result.length);
          // get today's date
          var today = new Date();
          var dd = today.getDate();
          var mm = today.getMonth()+1; //January is 0!
          var yyyy = today.getFullYear();
          if(dd<10)
           dd='0'+dd;
          if(mm<10)
            mm='0'+mm;
          $('#today').append(mm+'/'+dd+'/'+yyyy);
          var TODAY = mm+'/'+dd+'/'+yyyy;
          // getdate end
          var mailID_DDL = {};// store mail ddl for stevens announcement
          var out_of_date = [];// store mails with ddl more than one month before today
          for(var i = 0;i < 100;i++) { 
            gapi.client.gmail.users.messages.get({
              'userId': 'me',    
              'id': result[i].id,
            }).then(
              function(resp){
                appendMessageRowStevens(resp.result,TODAY,mailID_DDL,out_of_date);
              } 
            );
          };
        });
      }

 function listDelete(tab='#inbox-table',query_input='older_than:1m'){
                      
        $(tab).empty();     
        //$('#pop_up_modal').empty();         
        listMessages("me",query_input,function(result){
         $.each(result, function() { 
            gapi.client.gmail.users.messages.get({
              'userId': 'me',    
              'id': this.id     
            }).then(function(resp){
                //console.log(resp);
                appendMessageRowInbox(resp.result,tab);
            });
            //messageRequest.execute(appendMessageRowQuery(message));
          });
        })};
   function listQuery(query_input){
        $("#query_tbody").empty();      // query modal for list header information
        $('#pop_up_modal').empty();            // query modal for display content //care!! add this could decrease memory
        listMessages("me",query_input,function(result){
         $.each(result, function() { 
            gapi.client.gmail.users.messages.get({
              'userId': 'me',    
              'id': this.id     
            }).then(function(resp){
                //console.log(resp);
                appendMessageRowQuery(resp.result);
            });
            //messageRequest.execute(appendMessageRowQuery(message));
          });
        })};
/*the messages array as a result will be in callback function body*/
function listMessages(userId, query, callback) {
  var getPageOfMessages = function(request, result) {
    request.execute(function(resp) {
      result = result.concat(resp.messages);
      var nextPageToken = resp.nextPageToken;
       //console.log("pageToken: "+nextPageToken);
      if (nextPageToken) {
        request = gapi.client.gmail.users.messages.list({
          'userId': userId,
          'pageToken': nextPageToken,
          'q': query,
          //'maxResults': 20
        });
        getPageOfMessages(request, result);
      } else {
        callback(result);
      }
    });
  };
  var initialRequest = gapi.client.gmail.users.messages.list({
    'userId': userId,
    'q': query,
    //'maxResults': 20
  });
  /*console.log(initialRequest);
  console.log(initialRequest.messages.length);
  callback(initialRequest.messages);*/
  //console.log(initialRequest);
  getPageOfMessages(initialRequest, []);
};

 function appendMessageRowInbox(message,target_tab_table,diff_box="") {  // add email in home page //????
        if(target_tab_table===undefined) target_tab_table='#inbox-table';
        appendHeaderToBody(message,target_tab_table,diff_box);
        //console.log("append header row in inbox html.body!");
        appendModalToBody(message);
        $('#message-link-'+message.id).on('click', function(){
          var ifrm =  $('#message-iframe-'+message.id)[0].contentDocument || $('#message-iframe-'+message.id)[0].contentWindow.document;
          $(ifrm).contents().find('body').html(getBody(message.payload));
          //$('body', ifrm).html(getBody(message.payload)); 
          //console.log("message: ",message);
          var temp=getBody(message.payload);
            console.log("getbody: ",temp);
            console.log("end body");
            $.each(message.payload.headers,function(){
                console.log(this.name);
            });
            //The html() method sets or returns the content (innerHTML) of the selected elements. in this case, sets the ifrm         content using html content.
        });
         $('#inbox-table #message-link-'+message.id).mouseenter(function(){
              console.log('mousefunction activided');
                //$('#message-tr-'+message.id).addClass('bg-success');
              if($('#right-side-col').css('display')!=='none'){
                $('#right-side-col').empty();
                $('#right-side-col').append(getBody(message.payload));
              };
         });
        
      }

function appendMessageRowPersonal(message) {  // add email in home page
        appendHeaderToBody(message,'#personal-table');
        //console.log("append personal modal to html.body");
        appendModalToBody(message);
        $('#message-link-'+message.id).on('click', function(){
          var ifrm = $('#message-iframe-'+message.id)[0].contentWindow.document;
          $('body', ifrm).html(getBody(message.payload)); 
            console.log("messges link clicked!")
        });
        $('#message-link-'+message.id).mouseenter(function(){
                //$('#message-tr-'+message.id).addClass('bg-success');
              if($('#right-side-col').css('display')!=='none'){
                $('#right-side-col').empty();
                $('#right-side-col').append(getBody(message.payload));
                };
         });
      }
 function appendMessageRowStevens(message,TODAY,mailID_DDL,out_of_date){
        var DDL = getExpirationDate(message.payload);
<<<<<<< HEAD
        console.log(DDL);
         
        appendHeaderToBody(message,'#stevens-table');
=======
        console.log(message.id);
        mailID_DDL[message.id] = DDL;
        var outFlag = compareDate(TODAY,DDL);
        if(outFlag) out_of_date.push(message.id);// don't move this push function
        appendHeaderToBody(message,'#stevens-table').done(
          function(){
            if(outFlag){
              console.log('red');
              $('#stevens-table #message-tr-'+message.id).addClass('markAsRed');
            }
          }
        );
        //console.log(mailID_DDL);
        //console.log(out_of_date.length);
        //$('.mark').addClass('markAsRed');
        //console.log(message.id);
>>>>>>> 319484567c69f1af953ec2703f1dbd5351973b48
        //console.log("append stevens modal to html.body");
        appendModalToBody(message,'#stevens-modal');
        $('#message-link-'+message.id).on('click', function(){
          var ifrm = $('#message-iframe-'+message.id)[0].contentWindow.document;
          $('body', ifrm).html(getBody(message.payload)); 
            console.log("messges link clicked!")
        });
        var temp;
         $('#stevens-table #message-link-'+message.id).mouseenter(function(){
           //   console.log('function activided');
                //$('#message-tr-'+message.id).addClass('bg-success');
              if($('#right-side-col').css('display')!=='none'){
                $('#right-side-col').empty();
                $('#right-side-col').append(getBody(message.payload));
              };
              temp = $('#stevens-table #DateDDL-' + message.id).text();
              // console.log(temp);
              // gapi.client.gmail.users.messages.get({
              //     'userId': 'me',
              //     'id': message.id,
              // }).then(
              // function(resp) {
                $('#stevens-table #DateDDL-' + message.id).empty();
                $('#stevens-table #DateDDL-' + message.id).append('DDL: [' + mailID_DDL[message.id] + ']');
              //}
            //);
         });
         $('#stevens-table #message-link-'+message.id).mouseleave(function(){
                $('#stevens-table #DateDDL-' + message.id).empty();
                $('#stevens-table #DateDDL-' + message.id).append(temp);          
         });
 }

 function getExpirationDate(payload){
        console.log('---------------------------------------');
        var monthes = ['january','february','march','april','may',
                      'june','july','august','september','october',
                      'november','december','sep','dec','oct','aug',
                       'jan','feb','mar','apr','jun','jul','nov']
                       //,'sep.','dec.','oct.','aug.',
                      // 'jan.','feb.','mar.','apr.','jun.','jul.','nov.'];
        var monthToNum ={
          january: 1,          february: 2,          march: 3,
          april: 4,          may: 5,          june: 6,
          july: 7,          august: 8,          september: 9,
          october: 10,          november: 11,          december: 12,
          jan: 1,          feb: 2,          mar: 3,
          apr: 4,          may: 5,          jun: 6,
          jul: 7,          aug: 8,          sep: 9,
          oct: 10,          nov: 11,          dec: 12,
        }
<<<<<<< HEAD
        var content_plain = (getBody_plain_text(payload));
        console.log(content_plain);
        content_plain = content_plain.replace( /\n/g, ' ' ).replace( /\r\n/g, ' ' );
        var res = content_plain.toLowerCase().split(' ');
        var re = /\d{1,2}\/\d{1,2}\/\d+/;// '2nums/2nums/nums'
        var re2 = /\d+/;//'nums'
        var MaxM = '*', MaxD = '*', MaxY = '*';
=======
        var content_plain = (getBody(payload,true));
        //console.log(content_plain);
        content_plain = content_plain.replace( /\n/g, ' ' ).replace( /\r\n/g, ' ' );
        var res = content_plain.toLowerCase().split(' ');
        var re = /\d{1,2}\/\d{1,2}\/\d+/;// '2nums/2nums/nums'
        var re3 = /\d{4}\/\d{1,2}\/\d{1,2}/;// '2016/6/15'
        var re2 = /\d+/;//'nums'
        var MaxM, MaxD, MaxY, firstDateFlag = true;
>>>>>>> 319484567c69f1af953ec2703f1dbd5351973b48
        var DMY;
        // begin for loop
        for (var i = 0;i < res.length;i++){
          if(res[i].length == 0)
            continue;
          // to test if the string is matching my date format
          var temp,M,D,Y;
          if($.inArray(res[i],monthes) != -1){
            DMY = monthToNum[res[i]] + '/' + res[i+1].match(re2) + '/' + res[i+2].match(re2);
            //console.log('1DATE:[' + DMY + ']');// to debug
            temp = DMY.split('/');// to compare with the max date
<<<<<<< HEAD
=======
            M = temp[0], D = temp[1], Y = temp[2];
          }else if (re3.exec(res[i]) != null){
            DMY = res[i].match(re3);
            //console.log('3DATE:[' + DMY + ']');  
            temp = (DMY + '').split('/');        
            Y = temp[0], M = temp[1], D = temp[2];
>>>>>>> 319484567c69f1af953ec2703f1dbd5351973b48
          }else if (re.exec(res[i]) != null){
            DMY = res[i].match(re);
            //console.log('2DATE:[' + DMY + ']');  
            temp = (DMY + '').split('/');        
<<<<<<< HEAD
          }else{
            continue;
          };
=======
            M = temp[0], D = temp[1], Y = temp[2];
          }else continue;
>>>>>>> 319484567c69f1af953ec2703f1dbd5351973b48

          D = D + '';
          Y = Y + '';
          if(D != 'null'){// corner case e.g. mm/yyyy, mm/dd/y
            if(D > 31 && M < 13){
              if (D > 1000 && D < 3000){// assume the year is not gonna larger than 3000
                Y = D;
                D = 1;
              }else
                continue;
            }else if(Y == 'null' || Y <= 1000 || Y > 3000)
              Y = 2016;
          }else
            continue;
          //console.log('M:[' + MaxM + ']' + ' D:[' + MaxD + ']' + ' Y:[' + MaxY + ']');
          D = parseInt(D);
          M = parseInt(M);
          Y = parseInt(Y);
          //console.log('M:[' + M + ']' + ' D:[' + D + ']' + ' Y:[' + Y + ']');
          if(firstDateFlag){// compare the date
            MaxD = D;
            MaxM = M;
            MaxY = Y;
            firstDateFlag = false;
          }else if(compareDate(D,M,Y,MaxD,MaxM,MaxY)){
            MaxD = D;
            MaxM = M;
            MaxY = Y;
          }
        }
        // end for loop
        if(firstDateFlag){
          console.log('NONE');
          return 'none';
        }
        console.log(MaxM + '/' + MaxD + '/' + MaxY);
        return MaxM + '/' + MaxD + '/' + MaxY;
 }

function compareDate(D,M,Y,MaxD,MaxM,MaxY){
  if(M=='none'){
    return false;
  }
    if(Y == undefined){
      var temp1 = D.split('/');
      var temp2 = M.split('/');
      D = parseInt(temp1[1]); M = parseInt(temp1[0]); Y = parseInt(temp1[2]);
      MaxD = parseInt(temp2[1]); MaxM = parseInt(temp2[0]); MaxY = parseInt(temp2[2]);
      MaxM += 1; // out of date over one month 
      if(MaxM > 12){
        MaxY++;
        MaxM = 1;
      }
    }
    if(Y >= MaxY){
      if(Y == MaxY){
        if(M >= MaxM){
          if(M == MaxM){
             if(D > MaxD)
              return true;
          }else
            return true;
        }
      }else
        return true;
    }
    return false;
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

    function appendHeaderToBody(message,target,diff_box=""){
        var r = $.Deferred();
        if(target===undefined) target='#inbox-table';
        //console.log(message);
        //console.log(message);
        var time= new Date(getHeader(message.payload.headers, 'Date'));
        var prettyTime= $.format.prettyDate(time);
        if(prettyTime==="more than 5 weeks ago"){
            prettyTime=$.format.date(time, "ddd, dd/MMM/yyyy");
        }else{
            prettyTime=prettyTime+$.format.date(time, " (ddd)");
        }
        if(message.labelIds.indexOf('UNREAD')!=-1){
        $(target).append(
          '<tr id="message-tr-' + message.id+'" class="">\
            <td>\
                <div class="checkbox">\
                    <label><input type="checkbox" id="'+diff_box+'check-'+ message.id +'" value="'+message.id+'"></label>\
                </div>\
            </td>\
            <td>'+'<strong>'+getHeader(message.payload.headers, 'From')+'</strong>'+'</td>\
            <td>\
              <a href="#message-modal-' + message.id +
                '" data-toggle="modal" id="message-link-' + message.id+'">' +
               '<strong>'+getHeader(message.payload.headers, 'Subject') +'</strong>'+
              '</a>\
            </td>\
            <td id="DateDDL-'+ message.id +'">\
                  '+prettyTime+'\
            </td>\
          </tr>'
        );
        }else{
           $(target).append(
          '<tr id="message-tr-' + message.id+'" class="">\
            <td>\
                <div class="checkbox">\
                    <label><input type="checkbox" id="'+diff_box+'check-'+ message.id +'" value="'+message.id+'"></label>\
                </div>\
            </td>\
            <td>'+getHeader(message.payload.headers, 'From')+'</td>\
            <td>\
              <a href="#message-modal-' + message.id +
                '" data-toggle="modal" id="message-link-' + message.id+'">' +
                getHeader(message.payload.headers, 'Subject') +
              '</a>\
            </td>\
            <td id="DateDDL-'+ message.id +'">\
                  '+prettyTime+'\
            </td>\
          </tr>'
        ); 
        }
        setTimeout(function () {
          // and call `resolve` on the deferred object, once you're done
          r.resolve();
        }, 2500);
        return r;
        //return $.Deferred().resolve();
    }
    
    function appendModalToBody(message,target){
        
    if(target===undefined) target="body";
    //if(target==='#stevens-modal') console.log("stevens works");   
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

      function getBody(message,flag = false) { //message = message.payload
        var encodedBody = '';
        if(typeof message.parts === 'undefined')
        {
          encodedBody = message.body.data;
        }
        else
        {
          encodedBody = getHTMLPart(message.parts,flag);
        }
        encodedBody = encodedBody.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
        //console.log("encodeBody: ",encodedBody);
        return decodeURIComponent(escape(window.atob(encodedBody)));
      }

<<<<<<< HEAD
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

      function getBody_plain_text(message){
        var encodedBody = '';
        if(typeof message.parts === 'undefined')
        {
          encodedBody = message.body.data;
        }
        else
        {
          console.log(message.parts);
          encodedBody = getHTMLPart_plain_text(message.parts);
        }
        encodedBody = encodedBody.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
        //console.log("encodeBody: ",encodedBody);
        return decodeURIComponent(escape(window.atob(encodedBody)));
      }

      function getHTMLPart_plain_text(arr) {
=======
      function getHTMLPart(arr,flag = false) { 
        var type = 'text/html';
        if(flag){
          type = 'text/plain';
        }
>>>>>>> 319484567c69f1af953ec2703f1dbd5351973b48
        for(var x = 0; x <= arr.length; x++)
        {
          if(typeof arr[x].parts === 'undefined')
          {
            if(arr[x].mimeType === type)
            {
              return arr[x].body.data;
            }
          }
          else
          {
            return getHTMLPart(arr[x].parts,flag);
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
          //$('#menu-toggle').removeClass('hidden');
          //$('#right-side-toggle').removeClass('hidden');
          $('#footer').remove();
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
            //toggle preview
            $('#right-side-toggle').on('click',function(){
                 console.log($('#right-side-col').css('display'));
                $('#right-side-col').fadeToggle();
               
            });
            $('#delete-button').on('click',function(){
               //console.log($('#time option:selected'));
               //console.log($('#time').index());
               var time=$('#time option:selected').index();
               var tab=$('#tab-inbox option:selected').index();
               if(time===0){
                   time='older_than:1m';
               }else if(time===1){
                   time='older_than:3m';
               }else if(time===2){
                   time='older_than:6m';
               };
               if(tab===0){
                   tab='#inbox-table';
               }else if(tab===1){
                   tab="#inbox-table-unread";
               }else if(tab===2){
                   tab="#inbox-table-read";
               }else if(tab===3){
                   tab="#inbox-table-delete";
               }
               console.log(typeof time);
               if(typeof time!==Number&& typeof tab!==Number){
                 listDelete(tab,time);   
               }
            }); 
            $('#mailPage').removeClass('hidden');
            
           // $('#time').change(function(){console.log($('#time option:selected').val());} );
        } else {
          $('#mailcontent .emails').addClass('hidden');
          //$('#menu-toggle').addClass('hidden');
          $('#sidebar-wrapper').addClass('hidden');
          $('#nav_search').addClass("hidden");
          $('#welcome').removeClass('hidden');
          $('#authorize-button').removeClass("hidden"); //signin page
          $('#authorize-button').on('click', function(){
            handleAuthClick();
          });
        }
      }
