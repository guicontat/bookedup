var http 			= require('http')
, server 			= http.createServer()
, server2 			= http.createServer()
, server3           = http.createServer()
, io 				= require('socket.io').listen(server)
, io2 				= require('socket.io').listen(server2)
, io3               = require('socket.io').listen(server3)
, frame_size        = 1024
, user_ID           = []
, stopuserstream    = false
, RtpSession        = require("rtp-rtcp").RtpSession
, RtpPacket         = require("rtp-rtcp").RtpPacket
, r1                = new RtpSession(8000)
, floatArray        = new Float32Array(frame_size)
, floatArrayIndex   = 0
;
 
r1.on("listening",function(){
    console.log("rtp server is listening... on " + r1._portbase);
});
 
r1.on("message",function(msg,info){
    var rtpPacket=new RtpPacket(msg);
    stringToFloat(rtpPacket.getPayload().toString());

    if(user_ID.length > 0)
    {   
        for (var index=0; index<user_ID.length; index++) {
            if(user_ID[index].bool) {   
                var tmp = user_ID[index];
                io.sockets.socket(tmp.id).emit('getSound', rtpPacket.getPayload().toString(), rtpPacket.getPayload().toString().length);
            }
        }
    }
});

io.sockets.on('connection', function (socket) {

    var tmp = {id: socket.id, bool: false};
    user_ID.push(tmp);

    socket.on('startStream', function () {
        if(user_ID.length>0)
        {
            indexOf(socket.id, function (response) {
                user_ID[response].bool = true;
            });
            io2.sockets.emit('sendVoice');
        }
    });

    socket.on('stopStream', function () {
        if(user_ID.length>0)
        {
            indexOf(socket.id, function (response) {
                user_ID[response].bool = false;
            });
            io2.sockets.emit('stopVoice');
        }
    });

    socket.on('disconnect', function () {
        indexOf(socket.id, function (response) {
            user_ID.splice(response, 1);
        });
    });
});

io2.sockets.on('connection', function (socket) {
    socket.on('getVoice', function (response, frameSize, date) {
        if(user_ID.length > 0)
        {   
            for (var index=0; index<user_ID.length; index++) {
                if(user_ID[index].bool) {   
                    var tmp = user_ID[index];
                    io.sockets.socket(tmp.id).emit('getSound', response, frameSize, date);
                }
            }
        }
    });

    socket.on('disconnect', function() {
        io.sockets.emit('pauseUserStream');
    });

    socket.on('ping', function(startTime) {
        io.sockets.emit('pong', startTime);
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

function indexOf(anid, callback) {
    if(user_ID.length>0) {
        for (var index=0; index<user_ID.length; index++) {   
            if(user_ID[index].id === anid) {
                callback(index);
            }
        }
    }
}

function stringToFloat(string) {
    var s = "";
    for(var i=0;i<string.length-1;i++) {
        if(string[i]!==',') {
            s+=string[i];
        }
        else {
            if(floatArrayIndex<floatArray.length) {
                if(parseFloat(s) !== undefined) {
                    floatArray[floatArrayIndex] = parseFloat(s);
                    floatArrayIndex++;
                    s = "";
                }
            }
        }
    }
}
