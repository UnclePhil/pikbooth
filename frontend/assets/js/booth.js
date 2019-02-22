// -------------------------------------------- 
// script dedicated to booth actions
// Ph Koenig @2019
//---------------------------------------------
    var socket = io.connect('http://localhost');

    socket.on('connect', function(data) {
    	socket.emit('join', 'Booth connected');
    });
