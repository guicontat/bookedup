var http = require('http');
var fs = require('fs');
var wav = require('openwav');


var server = http.createServer(function(req, res) {
	fs.readFile('./index.html', 'utf-8', function(error, content) {
		res.writeHead(200, {"Content-Type": "text/html"});
		res.end(content);
	});
});
var readsound 		= [];
var io 				= require('socket.io').listen(server );
var filename 		= 'soundstream3.wav';
var dirname 		= __dirname + '/' + filename;
var filename2 		= 'soundstream.wav';
var dirname2 		= __dirname + '/' + filename2;




io.sockets.on('connection', function (socket) {
	socket.on('envoiduson', function (phrase){
		if(phrase === 'envoiduson')
		{
			wav.openwav(dirname2, function (error, response) {
				socket.emit('getsound', 
					response[0], 
					response[1], 
					response[2], 
					response[3], 
					response[4], 
					response[5], 
					response[6], 
					response[7], 
					response[8],
					response[9]
				);	
			});
		}
		if(phrase === 'envoiduson2')
		{
			wav.openwav(dirname, function (error, response) {
				socket.emit('getsound2', 
					response[0], 
					response[1], 
					response[2], 
					response[3], 
					response[4], 
					response[5], 
					response[6], 
					response[7], 
					response[8],
					response[9]
				);	
			});
		}
	});
	
});

server.listen(8080);