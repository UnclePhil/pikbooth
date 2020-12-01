// -------------------------------------------- 
// script dedicated to booth actions
// Ph Koenig @2019
//---------------------------------------------

  

  function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  }

  

    var socket = io.connect(window.location.origin);

    socket.on('connect', function(data) {
    	socket.emit('join', 'booth');
    });

    socket.on('allpicts', function(picts){ 
      if (picts.length > 0) {
        $( "#pop" ).hide();
        $( "#msg" ).hide();
        $( "main" ).empty();
        for (i = 0; i < picts.length; i++) {
            var url = "/thumb/"+picts[i];
            var html = '<img src="'+url+'"></img>'
            $('main').append(html);
        }
      }
      else {
        $( "#msg" ).show();
      }
    });

    socket.on('newpict', function(dt){ 
      $( "#pop" ).hide();
      $( "#msg" ).hide();
      var url = "/thumb/"+dt.pict;
      var html = '<img src="'+url+'"></img>'
      $('main').prepend(html);
    });
    
    socket.on('boothip', function(dt){ 
      $('#ip').html(dt);
    });

    socket.on('boothbuild', function(dt){
      // display build like in balena (7 char) 
      $('#build').html(dt.substring(0, 7));
    });

    socket.on('boothpictcount', function(dt){ 
      $('#pcount').html(dt);
    });
    
    
    socket.on('error', function(msg){ 
        console.log (msg)
    });
    socket.on('firebycmd', function() {
    	firepicture();
    });


// counting before picture
var counter = 4;
var intervalId = null;

function clearpop() {
    
}

function finish() {
  clearInterval(intervalId);
  counter = 4;
  $("#pop").hide();
}

function bip() {
    if(counter == 0) {
        $("#pop").html("Go");
        socket.emit('fire', 'Booth fire new pictures');
        counter--;
    }
    else if(counter==-1){
        finish()
    }
    else {	
        $("#pop").html(counter);;
        counter--;
    }	
}
function firepicture(){
  $("#pop").html(counter+1);  
  $("#pop").show() ; 
  intervalId = setInterval(bip, 1000);
}	


// allow click on booth
    $( "main" ).click(function() {
        firepicture();
      });