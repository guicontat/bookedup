var coreAudio                 = require("node-core-audio")
var engine                    = coreAudio.createNewAudioEngine()
var io                        = require('socket.io-client')
var frame_size                = 1024
var start_stream              = false
var disconnect                = false
var array                     = new Array()
var socket                    = io.connect('http://localhost:3000', {transports:['websocket']});



var audioQueue                = {
  
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

console.log('check 1', socket.socket.connected);
socket.on('connect', function(conn){
    console.log('check 2', socket.socket.connected);
    console.log(socket.socket.transport.name)
});

socket.on('sendVoice', function(){
    start_stream = true;
    socket.emit("ping",Date.now());
    console.log("START");
});

socket.on('stopVoice', function(){
    start_stream = false;
    console.log("STOP");
});

socket.on('disconnect', function(){
    socket = io.connect('http://localhost:3000');
    //socket = io.connect('http://preprod.live.vpauto.fr:3001');

});

function processAudio( inputBuffer ) {  
    if(start_stream) {
        //convert(inputBuffer[0], inputBuffer[0].length)
        var dataSize = 512;
        var i, j = 0, h = 0, y = 0;
        for(i=0 ; i+j< frame_size; i+= dataSize) {
            socket.emit('getVoice', inputBuffer[0].slice(i+j,i+dataSize+j),inputBuffer[0].slice(i,i+dataSize).length, Date.now());
        }
        if(i+j+dataSize<frame_size) {
            socket.emit('getVoice', inputBuffer[0].slice(i+j+dataSize+1,frameSize),inputBuffer[0].slice(i,i+dataSize).length, Date.now());
        }
    }
    return inputBuffer[0][0];
}

function convert(inputBuffer, length) {
    var min = 21;
    var count = 0;
    var string = new String();
    while(count*min<length) {
        for(var i = 0; i < min;i++)
        {
            string+=inputBuffer[i].toString()+',';
        }
        r2.sendPayload(new Buffer(string));
        console.log(count*min + " " + length)
        string = "";
        count++;
    }
    for(var i= (count-1)*min; i < length; i++){
        string+=inputBuffer[i].toString()+',';
        console.log(i);
        r2.sendPayload(new Buffer(string));
        if(i===1023) {
            r2.sendPayload(new Buffer("finish"));
        }
    }
}


engine.addAudioCallback( processAudio );
