// -------------------------------------------- 
// script dedicated to booth actions
// Ph Koenig @2019
//---------------------------------------------
var socket = io.connect(window.location.origin);

socket.on('connect', function(data) {
    socket.emit('join', 'Cmd');
});

socket.on('allpicts', function(picts){ 
    if (picts.length > 0) {
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


function fire() {
    socket.emit('fire', 'Cmd fire direct pictures');
}

function cmdfire() {
    socket.emit('cmdfire', 'Cmd fire booth picture');
}