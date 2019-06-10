var express = require('express')
var app = express();

app.use('/lib', express.static('lib'));
app.use('/assets', express.static('assets'));

app.get('/hello', function(req, res) {
	res.send('Hello World');
})

app.get('/', function(req, res) {
	res.sendFile( __dirname + "/" + "index.html" );
})

var server = app.listen(8080, function() {
	var host = server.address().address
	var port = server.address().port
	console.log("http://%s:%s", host, port)
})
