var http 			= require('http')
, fs 				= require('fs')
, wav 				= require('openwav')
, server 			= http.createServer()
, server2 			= http.createServer()
, io 				= require('socket.io').listen(server)
, io2 				= require('socket.io').listen(server2)
, filename 			= 'soundstream.wav'
, dirname 			= __dirname + '/' + filename
, filename2 		= 'soundstream3.wav'
, dirname2 			= __dirname + '/' + filename2
, nb_frame 			= 1
, frame_size        = 16384
, start_stream      = false
, soundBuffer		= new Float32Array(frame_size)
, audioQueue 		= {

    buffer: new Float32Array(0),

    write: function(newAudio){
        var currentQLength = this.buffer.length
        , newBuffer = new Float32Array(currentQLength+newAudio.length)
        ;

        newBuffer.set(this.buffer, 0);
        newBuffer.set(newAudio, currentQLength);
        this.buffer = newBuffer;
        
        console.log('Queued '+newBuffer.length+' samples.');
    },

    read: function(nSamples){
        var samplesToPlay = this.buffer.subarray(0, nSamples);
        this.buffer = this.buffer.subarray(nSamples, this.buffer.length);
        console.log('Queue at '+this.buffer.length+' samples.');
     
        return samplesToPlay;
    },

    length: function(){
        return this.buffer.length;
    }
};

io.sockets.on('connection', function (socket) {
	socket.on('envoiduson', function (phrase) {
        start_stream = true;
        socket.emit('getsound', audioQueue.read(frame_size), frame_size, nb_frame)
	});

    socket.on('stopbuffering', function (phrase){
        start_stream = false;
    });
});

io2.sockets.on('connection', function (socket) {
	socket.on('getvoice', function (response) {
			for(var i=0;i<frame_size;i++)
			{
				soundBuffer[i] = response[i]
			}
            if(start_stream)
			     audioQueue.write(soundBuffer);
	});
});

server.listen(8080);
server2.listen(3000)

