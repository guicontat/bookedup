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

    function encodeWAV(samples) {
        var arrayBuffer = new ArrayBuffer(samples.length);
        var bufferView = new Uint8Array(arrayBuffer);
        for (i = 0; i < samples.length; i++) {
            bufferView[i] = samples[i];
        }
        return arrayBuffer;
    }


    document.getElementById('enablesoundbut').addEventListener("click", enablesound);
    document.getElementById('disablesoundbut').addEventListener("click", disablesound);
    document.getElementById('startstreambut').addEventListener("click", startstream);
    document.getElementById('stopstreambut').addEventListener("click", stopstream);
    document.getElementById('play').addEventListener("click", play);
    document.getElementById('stop').addEventListener("click", stop);
    
    var player = document.querySelector('#audio1');
    var socket = io.connect('http://localhost:8080')
    var audioCtx = new AudioContext();
    source = audioCtx.createBufferSource();
    var scriptNode = audioCtx.createScriptProcessor(4096, 1, 1);
    console.log(scriptNode.bufferSize);


    scriptNode.onaudioprocess = function(audioProcessingEvent) {
        var inputBuffer = audioProcessingEvent.inputBuffer;
        var outputBuffer = audioProcessingEvent.outputBuffer;

        for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
            var inputData = inputBuffer.getChannelData(channel);
            var outputData = outputBuffer.getChannelData(channel);

            for (var sample = 0; sample < inputBuffer.length; sample++) {
               outputData[sample] = inputData[sample];
            }
        }
    }

    function enablesound(){
        source.connect(scriptNode);
        scriptNode.connect(audioCtx.destination);
        source.start();
    }

    function disablesound(){
    }

    function startstream(){
        socket.emit('envoiduson', 'envoiduson');
        socket.on('getsound', function (buffer, 
            chunkSize, 
            subChunk1Size, 
            audioFormat, 
            numChannels, 
            sampleRate, 
            byteRate, 
            blockAlign, 
            bitsPerSample,
        subChunk2Size) {
            dataview = encodeWAV(buffer.data)  
            audioCtx.decodeAudioData(dataview, function(buffer) {
                myBuffer = buffer;   
                source.buffer = myBuffer;
            });
            console.log(source);
        });
    }

    function stopstream(){
        socket.emit('envoiduson', 'envoiduson2');
        socket.on('getsound2', function (buffer, 
            chunkSize, 
            subChunk1Size, 
            audioFormat, 
            numChannels, 
            sampleRate, 
            byteRate, 
            blockAlign, 
            bitsPerSample,
        subChunk2Size) {
            dataview = encodeWAV(buffer.data)  
            audioCtx.decodeAudioData(dataview, function(buffer) {
                myBuffer = buffer;   
                source.buffer = myBuffer;
            });
        });
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