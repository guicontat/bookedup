var coreAudio               = require("node-core-audio")
, engine                    = coreAudio.createNewAudioEngine()
, io                        = require('socket.io-client')
, frame_size                = 2048
, start_stream              = true
, disconnect                = false
, testLatency               = true
, latency                   = undefined
, startTime                 = undefined
, socket                    = io.connect('http://localhost:3000')
, audioQueue                = {
  
    buffer: new Float32Array(0),

    write: function(newAudio){
        var currentQLength = this.buffer.length
        , newBuffer = new Float32Array(currentQLength+newAudio.length)
        ;

        newBuffer.set(this.buffer, 0);
        newBuffer.set(newAudio, currentQLength);
        this.buffer = newBuffer;
        //console.log('Queued '+newBuffer.length+' samples.');
    },

    read: function(nSamples){
        var samplesToPlay = this.buffer.subarray(0, nSamples);
        this.buffer = this.buffer.subarray(nSamples, this.buffer.length);
        //console.log('Queue at '+this.buffer.length+' samples.');
        return samplesToPlay;
    },

    length: function(){
        return this.buffer.length;
    }
};



function processAudio( inputBuffer ) {  
    if(start_stream) {
        audioQueue.write(inputBuffer[0]);
    }

    if(testLatency) {
        setInterval();
        testLatency = false;
    }

    socket.on('sendVoice', function(){
        start_stream = true;
        console.log("START");
    });

    socket.on('stopVoice', function(){
        start_stream = false;
        console.log("STOP");
    });

    socket.on('connect_error', function(err){
        socket.reconnect();
    });

    socket.on('disconnect', function(){
         socket = io.connect('http://localhost:3000');
    });

    if(audioQueue.length() === frame_size) {
        socket.emit('getVoice', audioQueue.read(frame_size));
    }
    return inputBuffer[0][0];
}

engine.addAudioCallback( processAudio );

function setInterval(){
  startTime = Date.now();
  socket.emit('ping', startTime);
  console.log("PING SEND");
}
