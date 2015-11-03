//Fe 22050
var coreAudio                 = require("node-core-audio");
var engine                    = coreAudio.createNewAudioEngine();
var io                        = require ('socket.io-client');
var frameSize                 = 1024;
var start_stream              = false;
//var socket                    = io.connect('http://localhost:3001', {transports:['websocket']});
var socket                    = io.connect('http://preprod.live.vpauto.fr:3000', {transports:['websocket','htmlfile','jsonp-polling']});

console.log('check 1', socket.socket.connected);
socket.on('connect', function(){
    console.log('check 2', socket.socket.connected);
});

socket.on('sendVoice22', function(){
    start_stream = true;
    socket.emit("ping",Date.now());
    console.log("START");
});

socket.on('stopVoice22', function(){
    start_stream = false;
    console.log("STOP");
});

socket.on('reconnect', function() {
    socket.emit('iAmReady22');
    console.log('iAmReady22');
});

socket.on('areYouReady22', function(){
    socket.emit('iAmReady22');
    console.log('iAmReady22');
});

socket.on('disconnect', function(){
    //socket = io.connect('http://localhost:3001');
    socket = io.connect('http://preprod.live.vpauto.fr:3000', {transports:['websocket','htmlfile','jsonp-polling']});
});

function processAudio( inputBuffer ) {  
    if(start_stream) {
        var dataSize = 512;
        var i, j = 0;
        for(i=0;i<inputBuffer[0].length;i++) {
            if(inputBuffer[0][i] < -1) {
                inputBuffer[0][i] = -1;
            }
            if(inputBuffer[0][i] > 1) {
                inputBuffer[0][i] = 1;
            }
        }
        for(i=0 ; i+j< frameSize; i+= dataSize) {
            socket.emit('getVoice22', inputBuffer[0].slice(i+j,i+dataSize+j),inputBuffer[0].slice(i,i+dataSize).length, Date.now());
        }
        if(i+j+dataSize<frameSize) {
            socket.emit('getVoice22', inputBuffer[0].slice(i+j+dataSize+1,frameSize),inputBuffer[0].slice(i,i+dataSize).length, Date.now());
        }
    }
    return inputBuffer[0][0];
}

engine.addAudioCallback( processAudio );
