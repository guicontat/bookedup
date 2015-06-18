var http = require('http');
var fs = require('fs');
var wav = require('wav');


var server = http.createServer(function(req, res) {
    fs.readFile('./index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});


var io = require('socket.io').listen(server );
var dirname = __dirname + '/soundstream.wav';
var filename = 'soundstream.wav';
var reader = new wav.Reader();

var input;

input = fs.createReadStream(dirname);
input.pipe(reader);

reader.once('readable', function () {
	var chunkSize = Number(reader.chunkSize);
	var sampleRate = reader.sampleRate;
	fs.open(dirname, 'r', function(status, fd) {
	if (status) {
			console.log(status.message);
			return;
	 }
	var buffer = new Buffer(chunkSize);

	fs.read(fd, buffer, 0, buffer.length, 44, function(err, num) {
		
	    io.sockets.on('connection', function (socket) {
			socket.emit('envoiduson', buffer, chunkSize, sampleRate );
		});
		
	});


});


	
});








server.listen(8080);