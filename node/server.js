var http 			= require('http')
, fs 				= require('fs')
, wav 				= require('openwav')
, server 			= http.createServer()
, server2 			= http.createServer()
, io 				= require('socket.io').listen(server,  { 'destroy buffer size': Infinity })
, io2 				= require('socket.io').listen(server2, { 'destroy buffer size': Infinity })
, filename 			= 'soundstream.wav'
, dirname 			= __dirname + '/' + filename
, filename2 		= 'soundstream3.wav'
, dirname2 			= __dirname + '/' + filename2
, nb_frame 			= 1
, frame_size        = 2048
, soundBuffer		= new Float32Array(frame_size)

io.sockets.on('connection', function (socket) {
    
    socket.on('stopbuffering', function (phrase){
        io2.sockets.emit('stopvoice')
    });

     socket.on('startbuffering', function (phrase){
        io2.sockets.emit('sendvoice')
    });
});

io2.sockets.on('connection', function (socket) {
    socket.on('getvoice', function (response) {
        io.sockets.emit('getsound', response, frame_size, nb_frame)
    });
});

server.listen(8080);
server2.listen(3000);

