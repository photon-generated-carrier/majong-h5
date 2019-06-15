var redis = require('redis')
var game = require("./game")


exports.Login = function(data, socket) {
	if (data.id == "" || data.password == "")
	{
		console.log('empty login info');
		socket.emit('login rsp', {ret: -1})
	}

	var client = redis.createClient(6379, '127.0.0.1')
	client.on('error', function (err) {
		console.log('Error ' + err);
		socket.emit('login rsp', {ret: -1})
	});

	client.hget('accounts', data.id, function(err, value) {
		if (err) {
			console.log('Error ' + err);
			socket.emit('login rsp', {ret: -1})
		} else {
			console.log('Got pwd: ' + value)
			var user = JSON.parse(value)
			// 内存记录
			game.Game.users[data.id] = {}
			game.Game.users[data.id].id = data.id
			game.Game.users[data.id].name = user.name;

			if (user == undefined) {
				socket.emit('login rsp', {ret: -2})
			} else {
				if (data.password == user.pwd) {
					console.log('login ok!');
					socket.emit('login rsp', {ret: 0, id:data.id, name:user.name})
					ret = 0
				} else {
					console.log('login failed!');
					socket.emit('login rsp', {ret: -1})
				}
			}
		}
		client.quit();
		socket.disconnect();
	})
}