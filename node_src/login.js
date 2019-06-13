var redis = require('redis')


exports.Login = function(data, socket) {
	if (data.username == "" || data.password == "")
	{
		console.log('empty login info');
		socket.emit('login rsp', {ret: -1})
	}

	var client = redis.createClient(6379, '127.0.0.1')
	client.on('error', function (err) {
		console.log('Error ' + err);
		socket.emit('login rsp', {ret: -1})
	});

	client.hget('accounts', data.username, function(err, value) {
		if (err) {
			console.log('Error ' + err);
			socket.emit('login rsp', {ret: -1})
		} else {
			console.log('Got pwd: ' + value)
			if (data.password == value) {
				console.log('login ok!');
				socket.emit('login rsp', {ret: 0})
				ret = 0
			} else {
				console.log('login failed!');
				socket.emit('login rsp', {ret: -1})
			}
		}
		client.quit();
		socket.disconnect();
	})
}