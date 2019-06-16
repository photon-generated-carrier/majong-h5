var redis = require('redis')
var game = require("./game")

exports.Login = function(data, socket) {
	if (data.id == "" || data.password == "")
	{
		console.log('empty login info');
		socket.emit('login rsp', {ret: -1})
		socket.disconnect();
		return
	}

	var curTime = new Date().getTime();

	// 检查在线 TODO: 先检查密码再检查在线
	if (game.Game.mOnline[data.id] != undefined) {
		var user = game.Game.mOnline[data.id];
		// 存在有效的登陆信息
		if (user.uptime != undefined && (curTime - user.uptime) < 300 * 1000) {
			console.log(data.id + " is online");
			socket.emit('login rsp', {ret: -10})
			socket.disconnect();
			return
		}
	}

	var client = redis.createClient(6379, '127.0.0.1')
	client.on('error', function (err) {
		console.log('Error ' + err);
		socket.emit('login rsp', {ret: -1})
		socket.disconnect();
		return
	});

	client.hget('accounts', data.id, function(err, value) {
		if (err) {
			console.log('Error ' + err);
			socket.emit('login rsp', {ret: -1})
		} else {
			console.log('Got pwd: ' + value)
			var user = JSON.parse(value)
		
			if (user == undefined) {
				console.log('用户不存在');
				socket.emit('login rsp', {ret: -20})
			} else {
				if (data.password == user.pwd) {
					console.log('login ok!');
					// 内存记录
					game.Game.users[data.id] = {}
					game.Game.users[data.id].id = data.id
					game.Game.users[data.id].name = user.name;

					var session = "session:" + data.id + ":" + curTime
					// 更新缓存
					game.UpdateSession(session)

					// 记录在线
					game.Game.mOnline[data.id] = {}
					game.Game.mOnline[data.id].session = session
					game.Game.mOnline[data.id].uptime = curTime

					socket.emit('login rsp', {ret: 0, id:data.id, name:user.name, session:session})
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

exports.LoginWithSession = function(data, socket) {
	if (data == undefined || data.session == undefined || data.session.length < 9)
	{
		console.log('empty login session');
		socket.emit('connect with session rsp', {ret: -1})
		socket.disconnect();
		return
	}

	// session_userid
	var session = data.session
	var arr = session.split(":")
	if (arr.length < 3) {
		console.log('empty login session');
		socket.emit('connect with session rsp', {ret: -1})
		socket.disconnect();
		return
	}
	var userid = arr[1]
	var session_time = parseInt(arr[2])
	var curTime = new Date().getTime()

	// 检查在线
	if (game.Game.mOnline[userid] != undefined) {
		var user = game.Game.mOnline[userid];
		if (session != user.session) {
			console.log(userid + " is online, get s:" + session + "actural s:" + user.session);
			socket.emit('connect with session rsp', {ret: -10})
			socket.disconnect();
			return
		}
	}

	// 检查 session有效
	if (game.GetSessionInfo(data.session) != undefined) {
		var name = game.GetUserName(userid)
		
		// 更新缓存
		game.UpdateSession(data.session)

		socket.emit('connect with session rsp', {ret: 0, id:userid, name: name, session: data.session})
		socket.disconnect();
		return
	}

	console.log('login with session failed!');
	socket.emit('connect with session rsp', {ret: -1})
	socket.disconnect();
	return
}