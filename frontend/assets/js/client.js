// -------------------------------------------- 
// script dedicated to booth actions
// Ph Koenig @2019
//---------------------------------------------
var socket = io.connect('http://localhost:3000');

socket.on('connect', function(data) {
    socket.emit('join', 'Client request all pictures');
});

socket.on('allpicts', function(picts){ 
    $( "#msg" ).hide();
    $( "main" ).empty();
    for (i = 0; i < picts.length; i++) {
        var url = "/pict/"+picts[i];
        var html = '<img src="'+url+'"></img>'
        $('main').append(html);
    }
});

socket.on('newpict', function(pict){ 
        console.log("receive new picture "+pict)
        var url = "/pict/"+pict;
        var html = '<img src="'+url+'"></img>'
        $('main').prepend(html);
});
socket.on('error', function(msg){ 
    console.log (msg)
});
