$(function(){
    var socket = io.connect();
    var $messageForm = $('#messageForm');
    var $message = $('#message');
    var $chat = $('#chat');
    var $err = $('#err');

    var $submitMsg = $('#submitMsg');
    var $submitWhisper = $('#submitWhisper');
    
    var $msgContainer = $('#msgContainer');
    var $messageArea = $("#messageArea");
    var $userFormArea = $("#userFormArea");
    var $userForm = $('#userForm');
    var $users = $('#users');
    var $username =$('#username');

    $submitMsg.click(function(e){
      e.preventDefault();
      //console.log("submitted");
      socket.emit('send message', $message.val());
      $message.val(' ');
    });

    $submitWhisper.click(function(e){
      e.preventDefault();
      //console.log("submitted");
      socket.emit('turn', $message.val());
      $message.val('');
      $("#submitWhisper").attr("disabled", true);
    });

    socket.on('new message', function(data){
      $chat.append('<div class="card card-body bg-light"> <strong>'+data.user+"</strong><i><small>"+getDate()+"</small></i>"+data.msg+'</div> <br/>');
      scrollDown();
    });

    $userForm.submit(function(e){
      e.preventDefault();
      $err.html("");
      socket.emit('new user', $username.val(), function(data){
        if(data){
          $userFormArea.hide();
          $msgContainer.show();
        }else{
            $err.html('Name in use. Please choose another one.');
        }
      });
      $username.val('');
    });

    socket.on('get users', function(data){
      var html = '';
      for(i =0; i<data.length; i++){
        html+='<li class="list-group-item">'+data[i]+'</li>';
      }
      $users.html(html);

    });

    socket.on('bot message', function(data){
      $("#submitWhisper").removeAttr("disabled");      
        $chat.append('<div class="card card-body" style="background-color: plum"> <strong> Server Bot: </strong> <i><small>'+getDate()+'</small></i>'+data+'</div> <br/>');
        scrollDown();
    });

    function scrollDown(){
     $chat.scrollTop($chat.get(0).scrollHeight);
    }
    function getDate(){
        return new Date().toLocaleString();
    }
  });