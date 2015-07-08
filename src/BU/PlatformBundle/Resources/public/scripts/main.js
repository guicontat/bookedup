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

    document.getElementById('enablesoundbut').addEventListener("click", enablesound);
    document.getElementById('disablesoundbut').addEventListener("click", disablesound);

    var audioContext = require('audio-context')
    , socket = io.connect('http://localhost:8080')
    , player = document.querySelector('#audio1')
    , scriptNode = audioContext.createScriptProcessor(8192, 1, 1)
    , silence = new Float32Array(8192)
    , nb_frame_prev = 0
    , bool_first_emit = false
    , audioQueue = {
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

    scriptNode.connect(audioContext.destination);

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

    try
    {
        scriptNode.onaudioprocess = function(e) {
            if (audioQueue.length() >= 8192)
            {
                
                e.outputBuffer.getChannelData(0).set(audioQueue.read(8192));
                audioProcessing();
            }
            else
            {
                e.outputBuffer.getChannelData(0).set(silence);
            }
        }
    }
    catch(e)
    {
        console.log(e);
    }

    socket.on('getsound', function (buffer, buffer_size, nb_frame) {
        audioQueue.write(getFloat(buffer ,buffer_size));
    });

    function enablesound(){
        if(!bool_first_emit)
        {
            socket.emit('envoiduson', 'envoiduson');
            bool_first_emit = true;
        }
    }

    function disablesound(){
        socket.emit('envoiduson', 'restartstream');
        bool_first_emit = false;
        audioQueue.buffer = new Float32Array(0);
    }

    function audioProcessing()
    {
        socket.emit('envoiduson', 'envoiduson');
        console.log(audioQueue.length());
    }

}
window.onload = addListeners;
},{"audio-context":1}]},{},[3]);