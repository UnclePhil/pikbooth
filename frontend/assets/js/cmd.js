// -------------------------------------------- 
// script dedicated to booth actions
// Ph Koenig @2019
//---------------------------------------------
var socket = io.connect(window.location.origin);

socket.on('connect', function(data) {
    socket.emit('join', 'cmd');
});

socket.on('allpicts', function(picts){ 
    if (picts.length > 0) {
        $( "#msg" ).hide();
        $( "main" ).empty();
        for (i = 0; i < picts.length; i++) {
            var url = "/thumb/"+picts[i];
            var url2 = "/pict/"+picts[i];
            var html = '<a href="'+url2+'" download="'+picts[i]+'"><img src="'+url+'"></img></a>'
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
    console.log("receive new picture "+dt.pict)
    var url = "/thumb/"+dt.pict;
    var url2 = "/pict/"+dt.pict;
    var html = '<a href="'+url2+'" download="'+dt.pict+'"><img src="'+url+'"></img></a>'
$('main').prepend(html);
});
socket.on('error', function(msg){ 
    console.log (msg)
});

socket.on('boothip', function(dt){ 
    $('#ip').html(dt);
  });

socket.on('boothbuild', function(dt){
    // display build like in balena (7 char) 
    $('#build').html(dt.substring(0, 7));
  });

socket.on('boothpictcount', function(dt){ 
    $('#io_count').html(dt);
  });

socket.on('config', function(cfg){ 
    $('#io_mode').html(cfg.mode);
  });


  function fire() {
    socket.emit('fire', 'Cmd fire direct pictures');
}

function cmdfire() {
    socket.emit('cmdfire', 'Cmd fire booth picture');
}

