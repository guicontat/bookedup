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
var filename 		= 'soundstream.wav';
var dirname 		= __dirname + '/' + filename;
var filename2 		= 'soundstream3.wav';
var dirname2 		= __dirname + '/' + filename2;
var pos_end = (16384+44)+1024;
var pos_start = 44;
var nb_frame = 1;


io.sockets.on('connection', function (socket) {
	socket.on('envoiduson', function (phrase){
		if(phrase === 'envoiduson')
		{
			wav.getData(dirname,0, pos_start, pos_end, function (error, response) {
				socket.emit('getsound', response[0], response[1], nb_frame);	
				pos_end+=16384+1024;
				pos_start+=16384+1024;
				nb_frame++;
			});
		}
		if(phrase === 'restartstream')
		{
			pos_end=(16384+44)+1024;
			pos_start=44;
			nb_frame=1;
			console.log("coucou");
		}

	});
	
});

server.listen(8080);