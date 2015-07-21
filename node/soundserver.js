var http 			= require('http')
, server 			= http.createServer()
, server2 			= http.createServer()
, server3           = http.createServer()
, io 				= require('socket.io').listen(server,  { 'destroy buffer size': Infinity })
, io2 				= require('socket.io').listen(server2, { 'destroy buffer size': Infinity })
, io3               = require('socket.io').listen(server3, { 'destroy buffer size': Infinity })
, frame_size        = 2048
, user_ID           = []
, stopuserstream    = false


io.sockets.on('connection', function (socket) {

    var tmp = {id: socket.id, bool: false};
    user_ID.push(tmp);

    socket.on('startStream', function () {
        if(user_ID.length>0)
        {
            indexOf(socket.id, function (response) {
                user_ID[response].bool = true;
            });
        }
    });

    socket.on('stopStream', function () {
        if(user_ID.length>0)
        {
            indexOf(socket.id, function (response) {
                user_ID[response].bool = false;
            });
        }
    });

    socket.on('disconnect', function () {
        indexOf(socket.id, function (response) {
            user_ID.splice(response, 1);
        });
    });
});

io2.sockets.on('connection', function (socket) {
    socket.on('getVoice', function (response) {
        if(user_ID.length > 0)
        {   
            for (var index=0; index<user_ID.length; index++) {
                if(user_ID[index].bool) {   
                    var tmp = user_ID[index];
                    io.sockets.socket(tmp.id).emit('getSound', response, frame_size);
                }
            }
        }
    });
});

io3.sockets.on('connection', function (socket) {
    
    socket.on('superPauseUserStream', function (){
        io.sockets.emit('pauseUserStream', 'something');
    });

    socket.on('superUnpauseUserStream', function (){
        io.sockets.emit('unpauseUserStream', 'something');
    });
});

server.listen(3050);
server2.listen(3000);
server3.listen(3040);

function indexOf(anid, callback)
{
    if(user_ID.length>0)
    {
        for (var index=0; index<user_ID.length; index++) {   
            if(user_ID[index].id === anid)
            {
                callback(index);
            }
        }
    }
}
