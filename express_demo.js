var express = require('express')
var app = express();

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
	console.log("http://%s:%s", host, port)
})
var io = require('socket.io')(server);

io.on('connection',  (socket)=>{
	console.log('client connect server, ok!');
  
	// io.emit()方法用于向服务端发送消息，参数1表示自定义的数据名，参数2表示需要配合事件传入的参数
	socket.emit('server message', {msg:'client connect server success'});
  
	socket.emit('news', {hello:'ppp'})
	// socket.broadcast.emmit()表示向除了自己以外的客户端发送消息
	socket.broadcast.emit('server message', {msg:'broadcast'});
  
	// 监听断开连接状态：socket的disconnect事件表示客户端与服务端断开连接
	socket.on('disconnect', ()=>{
	  console.log('connect disconnect');
	});
	
	// 与客户端对应的接收指定的消息
	socket.on('client message', (data)=>{
	  cosnole.log(data);// hi server
	});
  
	socket.disconnect();
});