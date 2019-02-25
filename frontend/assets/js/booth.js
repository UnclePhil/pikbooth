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
    	socket.emit('join', 'Booth request all pictures');
    });

    socket.on('allpicts', function(picts){ 
      if (picts.lenght > 0) {
        $( "#pop" ).hide();
        $( "#msg" ).hide();
        $( "main" ).empty();
        for (i = 0; i < picts.length; i++) {
            var url = "/pict/"+picts[i];
            var html = '<img src="'+url+'"></img>'
            $('main').append(html);
        }
      }
      else {
        $( "#msg" ).show();
      }
    });

    socket.on('newpict', function(pict){ 
      $( "#pop" ).hide();
      $( "#msg" ).hide();
      console.log("receive new picture "+pict)
      var url = "/pict/"+pict;
      var html = '<img src="'+url+'"></img>'
      $('main').prepend(html);
    });
    socket.on('error', function(msg){ 
        console.log (msg)
    });

// counting before picture
var counter = 4;
var intervalId = null;

function clearpop() {
    
}

function finish() {
  clearInterval(intervalId);
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