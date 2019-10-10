// -------------------------------------------- 
// script dedicated to booth actions
// Ph Koenig @2019
//---------------------------------------------
var socket = io.connect(window.location.origin);

socket.on('connect', function(data) {
    //socket.emit('join', 'cmd');
});

/// specials for settings

function cmdsetsave() {
    socket.emit('savesettings', );
    
}