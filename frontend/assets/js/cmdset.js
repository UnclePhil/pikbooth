// -------------------------------------------- 
// script dedicated to booth actions
// Ph Koenig @2019
//---------------------------------------------
var socket = io.connect(window.location.origin);

socket.on('connect', function(data) {
    socket.emit('join', 'cmd');
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

socket.on('config', function(cfg){ 
    $('#io_mode').html(cfg.mode);
  });

/// specials for settings

function cmdsetsave() {
  var select = document.getElementById('setmode');
  var value = select.options[select.selectedIndex].value;
    socket.emit('savesettings', value );
    
}