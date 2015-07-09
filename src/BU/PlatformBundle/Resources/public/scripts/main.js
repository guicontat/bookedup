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

    var audioContext        = require('audio-context')
    , socket                = io.connect('http://localhost:8080')
    , player                = document.querySelector('#audio1')
    , frame_size            = 2048
    , scriptNode            = audioContext.createScriptProcessor(frame_size, 1, 1)
    , silence               = new Float32Array(frame_size)
    , start_stream          = false
    ;
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
        console.log(float32)
        return float32;
    }

    socket.on('getsound', function (buffer, buffer_size, nb_frame) {
        scriptNode.onaudioprocess = function(e) {
            if (start_stream)
            {
                e.outputBuffer.getChannelData(0).set(getFloat(buffer, buffer_size));
            }
            else
            {   
                e.outputBuffer.getChannelData(0).set(silence);
            }
        }
    });

    function enablesound(){
        socket.emit('startbuffering', 'coucou');
        start_stream = true;
    }

    function disablesound(){
        socket.emit('stopbuffering');
        start_stream = false;
    }
}
window.onload = addListeners;
},{"audio-context":1}]},{},[3]);