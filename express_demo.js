var express = require('express')
var app = express();
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = 'debug';

Object.defineProperty(global, '__stack', {
	get: function(){
	  var orig = Error.prepareStackTrace;
	  Error.prepareStackTrace = function(_, stack){ return stack; };
	  var err = new Error;
	  Error.captureStackTrace(err, arguments.callee);
	  var stack = err.stack;
	  Error.prepareStackTrace = orig;
	  return stack;
	}
  });
  
Object.defineProperty(global, '__line', {
get: function(){
	return __stack[1].getLineNumber();
}
});
  
console.log(__dirname);
console.log(__filename);
console.log(__line);

logger.LOG_DEBUG = function (filename, line, d) {
	logger.debug("[" + filename + "][" + line + "] " + d)
}

app.use('/lib', express.static('lib'));
app.use('/src', express.static('src'));
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
	logger.LOG_DEBUG("http://%s:%s", host, port)
})

var socket = require("./node_src/socket")
socket.Socket.init(server)
socket.Socket.bind()