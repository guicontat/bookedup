var coreAudio               = require("node-core-audio")
, RtpSession                = require("rtp-rtcp").RtpSession
, RtpPacket                 = require("rtp-rtcp").RtpPacket
, engine                    = coreAudio.createNewAudioEngine()
, frame_size                = 16384
, start_stream              = false
, testLatency               = true
, ipaddress                 = "127.0.0.1"
, port                      = 8000
, r2                        = new RtpSession(port+1)
, nb_frame                  = 0
, disconnect                = false
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



r2.setRemoteAddress(port,ipaddress);
 
r2.on("error",function(err){
    console.log(err)
});


function processAudio( inputBuffer ) { 
    if(nb_frame == 0)
    { 
        convert(inputBuffer[0], inputBuffer[0].length)
        nb_frame++;
    }
    return inputBuffer[0][0];
}
engine.addAudioCallback( processAudio );

function convert(inputBuffer, length) {
    var min = 22;
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
        console.log(i)
    }
    r2.sendPayload(new Buffer(string));
    string = "";

}
