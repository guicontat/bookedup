(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var window = require('global/window');

var Context = window.AudioContext || window.webkitAudioContext;
if (Context) module.exports = new Context;

},{"global/window":2}],2:[function(require,module,exports){
(function (global){
if (typeof window !== "undefined") {
    module.exports = window;
} else if (typeof global !== "undefined") {
    module.exports = global;
} else {
    module.exports = {};
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
function addListeners(){

    var FastBase64 = {

        chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        encLookup: [],

        Init: function() {
            for (var i=0; i<4096; i++) {
                this.encLookup[i] = this.chars[i >> 6] + this.chars[i & 0x3F];
            }
        },

        Encode: function(src) {
            var len = src.length;
            var dst = '';
            var i = 0;
            while (len > 2) {
                n = (src[i] << 16) | (src[i+1]<<8) | src[i+2];
                dst+= this.encLookup[n >> 12] + this.encLookup[n & 0xFFF];
                len-= 3;
                i+= 3;
            }
            if (len > 0) {
                var n1= (src[i] & 0xFC) >> 2;
                var n2= (src[i] & 0x03) << 4;
                if (len > 1) n2 |= (src[++i] & 0xF0) >> 4;
                dst+= this.chars[n1];
                dst+= this.chars[n2];
                if (len == 2) {
                    var n3= (src[i++] & 0x0F) << 2;
                    n3 |= (src[i] & 0xC0) >> 6;
                    dst+= this.chars[n3];
                }
                if (len == 1) dst+= '=';
                dst+= '=';
            }
            return dst;
        } // end Encode

    }

    FastBase64.Init();

    var RIFFWAVE = function(data, chunkSize, subChunk1Size, audioFormat, numChannels, sampleRate, byteRate, blockAlign, bitsPerSample, subChunk2Size) {

        this.data = [];        // Array containing audio samples
        this.wav = [];         // Array containing the generated wave file
        this.dataURI = '';     // http://en.wikipedia.org/wiki/Data_URI_scheme

        this.header = {                                 // OFFS SIZE NOTES
            chunkId      : [0x52,0x49,0x46,0x46],       // 0    4    "RIFF" = 0x52494646
            chunkSize    : chunkSize,                   // 4    4    36+SubChunk2Size = 4+(8+SubChunk1Size)+(8+SubChunk2Size)
            format       : [0x57,0x41,0x56,0x45],       // 8    4    "WAVE" = 0x57415645
            subChunk1Id  : [0x66,0x6d,0x74,0x20],       // 12   4    "fmt " = 0x666d7420
            subChunk1Size: subChunk1Size,               // 16   4    16 for PCM
            audioFormat  : audioFormat,                 // 20   2    PCM = 1
            numChannels  : numChannels,                 // 22   2    Mono = 1, Stereo = 2...
            sampleRate   : sampleRate,                  // 24   4    8000, 44100...
            byteRate     : byteRate,                    // 28   4    SampleRate*NumChannels*BitsPerSample/8
            blockAlign   : blockAlign,                  // 32   2    NumChannels*BitsPerSample/8
            bitsPerSample: bitsPerSample,               // 34   2    8 bits = 8, 16 bits = 16
            subChunk2Id  : [0x64,0x61,0x74,0x61],       // 36   4    "data" = 0x64617461
            subChunk2Size: subChunk2Size                // 40   4    data size = NumSamples*NumChannels*BitsPerSample/8
        };

        
        function u32ToArray(i) {
            return [i&0xFF, (i>>8)&0xFF, (i>>16)&0xFF, (i>>24)&0xFF];
        }

        function u16ToArray(i) {
            return [i&0xFF, (i>>8)&0xFF];
        }

        function split16bitArray(data) {
            var r = [];
            var j = 0;
            var len = data.length;
            for (var i=0; i<len; i++) {
                r[j++] = data[i] & 0xFF;
                r[j++] = (data[i]>>8) & 0xFF;
            }
            return r;
        }

        this.Make = function(data) {
            if (data instanceof Array) this.data = data;
            this.header.blockAlign = (this.header.numChannels * this.header.bitsPerSample) >> 3;
            this.header.byteRate = this.header.blockAlign * this.sampleRate;
            this.header.subChunk2Size = this.data.length * (this.header.bitsPerSample >> 3);
            this.header.chunkSize = 36 + this.header.subChunk2Size;

            this.wav = this.header.chunkId.concat(
                u32ToArray(this.header.chunkSize),
                this.header.format,
                this.header.subChunk1Id,
                u32ToArray(this.header.subChunk1Size),
                u16ToArray(this.header.audioFormat),
                u16ToArray(this.header.numChannels),
                u32ToArray(this.header.sampleRate),
                u32ToArray(this.header.byteRate),
                u16ToArray(this.header.blockAlign),
                u16ToArray(this.header.bitsPerSample),    
                this.header.subChunk2Id,
                u32ToArray(this.header.subChunk2Size),
                (this.header.bitsPerSample == 16) ? split16bitArray(this.data) : this.data
            );
            this.dataURI = 'data:audio/wav;base64,'+FastBase64.Encode(this.wav);
        };

        if (data instanceof Array) this.Make(data);

    }; // end RIFFWAVE


    function initWavReader(){
        wavReader = new RiffPcmWaveReader();
        wavReader.onopened = wavReaderOpened;
        wavReader.onloadend = wavReaderLoadend;
        wavReader.onerror = wavReaderError;
    }

    function wavReaderOpened(){
        var rate = wavReader.getSamplingRate()
        , bitsPerSample = wavReader.getBitsPerSample()
        , channels = wavReader.getChannels()
        , chunkBytes = wavReader.getDataChunkBytes()
        , seconds = (chunkBytes / (rate * channels * (bitsPerSample/8))).toFixed(2)
        ;
        console.log('sample rate : ' + rate + ' BitsPerSample : ' + bitsPerSample +  ' Channels : ' + channels + ' ChunkBytes : ' + chunkBytes);
        wavReader.seek(0);
        wavReader.read(file_io_buffer_size);
    }

    function wavReaderLoadend(ev){
        console.log('WaveReader read '+ ev.target.result.byteLength+' bytes.');
        doEncodeDecode(ev.target.result);
        // Read while there's still bytes!
        if(ev.target.result.byteLength>0)
        wavReader.read(file_io_buffer_size);
    }

    function wavReaderError(reason){
        console.log('wavReader error: ', reason);
    }

    function writeString(view, offset, string){
        for (var i = 0; i < string.length; i++){
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    function floatTo16BitPCM(output, offset, input){
        for (var i = 0; i < input.length; i++, offset+=8){
            output.setUint8(input[i], offset , true);
        }
    }

    function returnArray(samples) {
        var arrayBuffer = new ArrayBuffer(samples.length);
        var bufferView = new Uint8Array(arrayBuffer);
        for (i = 0; i < samples.length; i++) {
            bufferView[i] = samples[i];
        }
        //console.log(bufferView)
        return arrayBuffer;
    }

    function returnBlob(samples) {
        var arrayBuffer = new ArrayBuffer(samples.length);
        var bufferView = new Uint8Array(arrayBuffer);
        for (i = 0; i < samples.length; i++) {
            bufferView[i] = samples[i];
        }
        //console.log(bufferView)
        return bufferView;
    }

    function encodeArrayBuffer_Float32(samples) {
        var bufferView = new Uint8Array(samples);
        var float32 = new Float32Array(samples.byteLength/2);
        for (i = 0; i < bufferView.byteLength; i++) {
            float32[i] = bufferView[i*2]/255*2-1;
        }
        return float32;
    }

    function encodeData_Float32(samples) {
        var float32 = new Float32Array(samples.length/2);
        for (i = 0; i < samples.length; i++) {
            float32[i] = samples[i*2]/255*2-1;
        }
        return float32;
    }

    function getFloat(samples, buffer_size)
    {
        var float32 = new Float32Array(buffer_size);
        for (i = 0; i < buffer_size; i++) {
            float32[i] = samples[i];
        }
        return float32;
    }

    document.getElementById('enablesoundbut').addEventListener("click", enablesound);
    document.getElementById('disablesoundbut').addEventListener("click", disablesound);
    document.getElementById('startstreambut').addEventListener("click", startstream);
    document.getElementById('stopstreambut').addEventListener("click", stopstream);
    document.getElementById('play').addEventListener("click", play);
    document.getElementById('stop').addEventListener("click", stop);
    

    var audioContext = require('audio-context');
    var player = document.querySelector('#audio1');
    var socket = io.connect('http://localhost:8080');
    var cpt1024 = 0;

    var audioQueue = {
        buffer: new Float32Array(0),

        write: function(newAudio){
            var currentQLength = this.buffer.length
            , newBuffer = new Float32Array(currentQLength+newAudio.length)
            ;

            newBuffer.set(this.buffer, 0);
            newBuffer.set(newAudio, currentQLength);
            this.buffer = newBuffer;
            // console.log('Queued '+newBuffer.length+' samples.');
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

    socket.emit('envoiduson', 'restartstream');

    var scriptNode = audioContext.createScriptProcessor(2048, 1, 1)
    , silence = new Float32Array(2048)
    ;

    scriptNode.onaudioprocess = function(e) {
    if (audioQueue.length())
    {
        e.outputBuffer.getChannelData(0).set(audioQueue.read(2048));
        socket.emit('envoiduson', 'envoiduson');
    }
    else
        e.outputBuffer.getChannelData(0).set(silence);
    }

    scriptNode.connect(audioContext.destination);
    
    function enablesound(){
       
    }

    function disablesound(){
    }

    function startstream(){
        var nb_frame_prev = 0;
        socket.emit('envoiduson', 'envoiduson');
        socket.on('getsound', function (buffer, buffer_size, nb_frame) {
            audioQueue.write(getFloat(buffer ,buffer_size));
            if(nb_frame == (nb_frame_prev+1))
            {
                nb_frame_prev++;
            }
        });
    }

    function stopstream(){
        socket.emit('envoiduson', 'restartstream');
    }

    function play() {
        player.play()
    }

    function stop() {
        player.pause();
        player.currentTime = 0;
    }

   
}
window.onload = addListeners;
},{"audio-context":1}]},{},[3]);
