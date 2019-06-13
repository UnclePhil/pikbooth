// -------------------------------------------- 
// script dedicated to booth actions
// Ph Koenig @2019
//---------------------------------------------
var socket = io.connect(window.location.origin);

socket.on('connect', function(data) {
    socket.emit('join', 'Client');
});

socket.on('allpicts', function(picts){ 
    if (picts.length > 0){
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

socket.on('newpict', function(pict){ 
    $( "#pop" ).hide();
    $( "#msg" ).hide();
    console.log("receive new picture "+pict)
    var url = "/thumb/"+pict;
    var html = '<img src="'+url+'"></img>'
    $('main').prepend(html);
});
socket.on('error', function(msg){ 
    console.log (msg)
});
