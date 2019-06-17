var redis = require('redis')
var game = require("./game")
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = 'debug';

logger.LOG_DEBUG = function (filename, line, d) {
	logger.debug("[" + filename + "][" + line + "] " + d)
}

logger.LOG_ERROR = function (filename, line, d) {
	logger.debug("[" + filename + "][" + line + "] " + d)
}

exports.Login = function(data, socket) {
	if (data.id == "" || data.password == "")
	{
		logger.LOG_DEBUG(__filename, __line, 'empty login info');
		socket.emit('login rsp', {ret: -1})
		socket.disconnect();
		return
	}

	var curTime = new Date().getTime();

	// 检查在线 TODO: 先检查密码再检查在线
	// if (game.Game.mOnline[data.id] != undefined) {
	// 	var user = game.Game.mOnline[data.id];
	// 	// 存在有效的登陆信息
	// 	if (user.uptime != undefined && (curTime - user.uptime) < 300 * 1000) {
	// 		logger.LOG_DEBUG(__filename, __line, data.id + " is online");
	// 		socket.emit('login rsp', {ret: -10})
	// 		socket.disconnect();
	// 		return
	// 	}
	// }

	var client = redis.createClient(6379, '127.0.0.1')
	client.on('error', function (err) {
		logger.LOG_ERROR(__filename, __line, 'Error ' + err);
		socket.emit('login rsp', {ret: -1})
		return
	});

	client.hget('accounts', data.id, function(err, value) {
		if (err) {
			logger.LOG_ERROR(__filename, __line, 'Error ' + err);
			socket.emit('login rsp', {ret: -1})
		} else {
			logger.LOG_DEBUG(__filename, __line, 'Got pwd: ' + value)
			var user = JSON.parse(value)
		
			if (user == undefined) {
				logger.LOG_DEBUG(__filename, __line, '用户不存在');
				socket.emit('login rsp', {ret: -20})
			} else {
				if (data.password == user.pwd) {
					logger.LOG_DEBUG(__filename, __line, 'login ok!');
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
					logger.LOG_ERROR(__filename, __line, 'login failed!');
					socket.emit('login rsp', {ret: -1})
				}
			}
		}
		client.quit();
	})
}

exports.LoginWithSession = function(data, socket) {
	var res = {};
	if (data == undefined || data.session == undefined || data.session.length < 9)
	{
		logger.LOG_ERROR(__filename, __line, 'empty login session');
		res.ret = -1;
		return res
	}

	// session_userid
	var session = data.session
	var arr = session.split(":")
	if (arr.length < 3) {
		logger.LOG_ERROR(__filename, __line, 'empty login session');
		res.ret = -1;
		return res
	}
	var userid = arr[1]
	var session_time = parseInt(arr[2])
	var curTime = new Date().getTime()

	// 检查在线
	// if (game.Game.mOnline[userid] != undefined) {
	// 	var user = game.Game.mOnline[userid];
	// 	if (session != user.session) {
	// 		logger.LOG_ERROR(__filename, __line, userid + " is online, get s:" + session + "actural s:" + user.session);
	// 		res.ret = -10;
	// 		return res
	// 	}
	// }

	// 检查 session有效
	if (game.GetSessionInfo(data.session) != undefined) {
		var name = game.GetUserName(userid)
		
		// 更新缓存
		game.UpdateSession(data.session)

		logger.LOG_DEBUG(__filename, __line, 'login with session succ!');
		res.ret = 0;
		res.id = userid;
		res.name = name;
		return res
	}

	logger.LOG_ERROR(__filename, __line, 'login with session failed!');
	res.ret = -1
	return res
}