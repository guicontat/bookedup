var coreAudio               = require("node-core-audio")
, engine                    = coreAudio.createNewAudioEngine()
, io                        = require('socket.io-client')
, frame_size                = 16384
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


function processAudio( inputBuffer ) {
    audioQueue.write(inputBuffer[0]);
    if(audioQueue.length() == frame_size)
    {
        socket.emit('getvoice', audioQueue.read(frame_size));
    }
    return inputBuffer[0][0];
}

engine.addAudioCallback( processAudio );
