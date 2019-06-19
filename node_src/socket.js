login = require("./login")
game = require("./game")
var logger = require("./mylogger")

// 在线用户保活踢出
// setInterval(function() {
// 	var curTime = new Date().getTime();

// 	for (var key in game.Game.mOnline) {
// 		var user = game.Game.mOnline[key]
// 		if ((curTime - user.uptime) > 240 * 1000) {
// 			logger.LOG_DEBUG(__filename, __line, "remove " + key + "from online list, time:" + user.uptime)
// 			delete game.Game.mOnline[key];  
// 		}
// 	}
// }, 2000)

var objfile = this

function GetRandomNum(Min,Max) {   
	var Range = Max - Min;   
	var Rand = Math.random();   
	return(Min + Math.round(Rand * Range));   
}

exports.NotifyUserChanged = function(socket, roomid, data) {
	socket.to(roomid).emit("room users changed", data)
}

exports.Socket = {
	io : {},
	
	// 向房间发送游戏消息
	SendGameMessage : function (roominfo, msg) {
		logger.LOG_DEBUG(__filename, __line, "send msg to " + JSON.stringify(roominfo) + ", "+ JSON.stringify(msg))
		// 通知房间内的用户
		var key = "room_" + roominfo.id
		for (var i in this.socekts[key])
		{
			this.socekts[key][i].emit('game msg', msg)
		}
	},

	// SendGameMessageTo : function (roominfo, userid, msg) {
	// 	// logger.LOG_DEBUG(__filename, __line, "send msg to " + JSON.stringify(roominfo) + ", "+ userid + ", "+ JSON.stringify(msg))
	// 	// // 通知房间内的用户
	// 	// var key = "room_" + roominfo.id
	// 	// io.of("/login").
	// 	// for (var i in socket.rooms[key])
	// 	// {
	// 	// 	if (this.socekts[key][i].userid == userid) {
	// 	// 		this.socekts[key][i].emit('game msg', msg)
	// 	// 	}
	// 	// }
	// },

	init: function(server) {
		io = require('socket.io')(server, {pingInterval: 5000,
			pingTimeout: 1000});
	},
	bind: function() {
		var obj = this
		io.of("/login").on('connection',  (socket)=>{
			logger.LOG_DEBUG(__filename, __line, 'client connect server /login, ok!');

			// 用户名密码登陆
			socket.on('login req', (data)=>{
				logger.LOG_DEBUG(__filename, __line, "login req: " + JSON.stringify(data));
				login.Login(data, socket)
			});

			// session登陆
			socket.on('connect with session req', (data, callback)=>{
				logger.LOG_DEBUG(__filename, __line, "connect with session req " + JSON.stringify(data));
				let res = login.LoginWithSession(data)

				if (res.ret == 0) {
					socket.my = {}
					socket.my.userid = res.id;
					socket.my.session = res.session;
				}
				callback(res)
			});

			socket.on('disconnect', (reason)=>{
				var user = "Unknown";
				if (socket.my != undefined && socket.my.userid != undefined) {
					user = socket.my.userid
				}
				logger.LOG_DEBUG(__filename, __line, user + ' connect disconnect:' + reason);
				// 处理掉线
				if (socket.my != undefined && socket.my.userid != undefined) {
					game.HandleDisconnect(socket.my.userid, 0)
					game.LeaveRoom(socket)
				}
			});

			// 包活 (客户断收到pong)
			socket.on('pongs', () => {
				if (socket.my != undefined && socket.my.userid != undefined) {
					logger.LOG_INFO(__filename, __line, 'recv pongs from: ' + socket.my.userid);
					game.UpdateOnline(socket.my.userid)
				}
			})

			socket.on('reconnect_attempt', (times) => {
				if (socket.my != undefined) {
					logger.LOG_DEBUG(__filename, __line, 'reconncet [' + times + '] to ' + socket.my.userid);
					game.Game.mOnline[socket.my.userid].re_time = times;
				}
			});

			socket.on('reconnect', (times) => {
				if (socket.my != undefined) {
					logger.LOG_DEBUG(__filename, __line, 'reconncet [' + times + '] to ' + socket.my.userid + ' succ');
					game.Game.mOnline[socket.my.userid].re_time = 0;
				}
			});

			socket.on('connect_error', (error) => {
				var user = "Unknown";
				if (socket.my != undefined && socket.my.userid != undefined) {
					user = socket.my.userid
				}
				logger.LOG_DEBUG(__filename, __line, 'connect_error of: ' + user + " by " + error);
			});

			// 房间列表
			socket.on('rooms req', (data, callback)=>{
				logger.LOG_INFO(__filename, __line, "rooms req: " + JSON.stringify(data));
				var res = new Array()
				for (var key in game.Game.rooms) {
					var room = {};
					room.id = key;
					room.num = game.Game.rooms[key].users.length;
					room.title = game.Game.rooms[key].title;
					room.gm = game.Game.rooms[key].gm;
					room.started = game.Game.rooms[key].started;
					res.push(room)
				}
				callback(res)
			})

			// 创建房间
			socket.on('create room req', (data, callback)=>{
				logger.LOG_DEBUG(__filename, __line, "create room req: " + JSON.stringify(data));
				
				var res = {};
				res.users = new Array() // user列表
				
				var roominfo = game.CreateRoom(data.userid)
				res.roominfo = {}
				res.roominfo.id = roominfo.id;
				res.roominfo.gm = roominfo.gm;

				for (i = 0; i < roominfo.users.length; i++)
				{
					res.users[i] = game.Game.users[roominfo.users[i].id];
				}

				// 记录连接
				socket.join(roominfo.id)
				socket.my.roomid = roominfo.id

				callback(res)
			})

			// 进入房间
			socket.on('enter room req', (data, callback)=>{
				logger.LOG_DEBUG(__filename, __line, "enter room req: " + JSON.stringify(data));

				// 加入
				var res = game.EnterRoom(data.user, data.roomid)
				if (res.ret != 0) {
					res.ret = -1;
					callback(res)
					return
				}

				// 通知房间内的用户
				logger.LOG_DEBUG(__filename, __line, "notify user changed to:" + data.roomid + ", " + JSON.stringify(res))
				objfile.NotifyUserChanged(socket, data.roomid, res)

				socket.join(data.roomid)
				socket.my.roomid =data.roomid
				callback(res)
			})

			// 离开房间
			socket.on('leave room', (data)=>{
				game.LeaveRoom(socket, data)
			})

			socket.on('start game req', (data)=>{
				logger.LOG_DEBUG(__filename, __line, 'start game req ' + data.roomid)
				var msg = {}
				msg.state = "init card";

				var roominfo = game.Game.rooms[data.roomid]
				roominfo.started = true;

				var games = game.Game.initGame()
				game.Game.games[data.roomid] = {}
				var mgames = game.Game.games[data.roomid]
				mgames.cards = games.cards
				mgames.state = "change" // 换牌阶段
				// msg.cards = mgames.cards;

				// obj.SendGameMessage(roominfo, msg)

				mgames.users = []
				for (var i = 0; i < 4; i++) {
					mgames.users[i] = {}
					mgames.users[i].id = roominfo.users[i].id;
					mgames.users[i].cards = games.vec[i]
					// msg.usercards = games.vec[i]
					// // msg.banker = mgames.users[i].id
					// // 手牌单独发给用户
					// obj.SendGameMessageTo(roominfo, mgames.users[i].id, msg)
				}
				msg.users = mgames.users
				io.of("/login").to(roominfo.id).emit('game msg', msg)
			})
		})
	}

}