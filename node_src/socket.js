login = require("./login")
game = require("./game")
var log4js = require('log4js');
var logger = log4js.getLogger();

logger.LOG_DEBUG = function (filename, line, d) {
	logger.debug("[" + filename + "][" + line + "] " + d)
}

logger.LOG_ERROR = function (filename, line, d) {
	logger.debug("[" + filename + "][" + line + "] " + d)
}

// 在线用户保活踢出
setInterval(function() {
	var curTime = new Date().getTime();

	for (var key in game.Game.mOnline) {
		var user = game.Game.mOnline[key]
		if ((curTime - user.uptime) > 240 * 1000) {
			logger.LOG_DEBUG(__filename, __line, "remove " + key + "from online list, time:" + user.uptime)
			delete game.Game.mOnline[key];  
		}
	}
}, 2000)

function GetRandomNum(Min,Max) {   
	var Range = Max - Min;   
	var Rand = Math.random();   
	return(Min + Math.round(Rand * Range));   
}

exports.Socket = {
	io : {},
	socekts : new Map,

	// 向房间发送notify
	NotifyUserChange : function(roominfo) {
		// 通知
		var res = {};
		res.users = new Array() // user列表
	
		res.roominfo = {}
		res.roominfo.id = roominfo.id;
		res.roominfo.gm = roominfo.gm;
		for (i = 0; i < roominfo.users.length; i++)
		{
			res.users[i] = game.Game.users[roominfo.users[i].id];
		}
	
		// 通知房间内的用户
		var key = "room_" + roominfo.id
		for (var i in this.socekts[key])
		{
			logger.LOG_DEBUG(__filename, __line, "notify user changed to:" + this.socekts[key][i].id + ", " + JSON.stringify(res))
			this.socekts[key][i].emit('room users changed', res)
		}

		return res
	},
	
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

	SendGameMessageTo : function (roominfo, userid, msg) {
		logger.LOG_DEBUG(__filename, __line, "send msg to " + JSON.stringify(roominfo) + ", "+ userid + ", "+ JSON.stringify(msg))
		// 通知房间内的用户
		var key = "room_" + roominfo.id
		for (var i in this.socekts[key])
		{
			if (this.socekts[key][i].userid == userid) {
				this.socekts[key][i].emit('game msg', msg)
			}
		}
	},

	handleLeave : function(socket, data) {
		if (data.userid == undefined || data.roomid == undefined) {
			socket.disconnect();
		}

		logger.LOG_DEBUG(__filename, __line, data.userid + " leave room " + data.roomid)
		var founded = false;
		// 从socket列表中移除
		for(var key in this.socekts) {
			var index = this.socekts[key].indexOf(socket);
			if (index > -1) {
				logger.LOG_DEBUG(__filename, __line, "remove from " + key)
				this.socekts[key].splice(index, 1);
				founded = true;
			}
		}

		if (!founded) { return }

		var roominfo = game.Game.rooms[data.roomid]
		if (roominfo == undefined) { return }
		key = "room_" + data.roomid;
		// 游戏已开始
		if (roominfo.started != undefined && roominfo.started) {
			logger.LOG_DEBUG(__filename, __line, "game had started...")
			var msg = {}
			msg.state = "end";
			msg.oper = data.userid;
			msg.op = "leave"
			this.SendGameMessage(roominfo, msg)
		} else {
			// 更新人员
			for (var i = 0; i < roominfo.users.length; i++) {
				if (roominfo.users[i].id == data.userid) {
					logger.LOG_DEBUG(__filename, __line, "remove " + data.userid + " from room")
					roominfo.users.splice(i, 1);
					break;
				}
			}

			// 是否还有人
			if (roominfo.users.length == 0) {
				logger.LOG_DEBUG(__filename, __line, "destroy room " + roominfo.id)
				// 销毁房间
				game.removeRoom(roominfo.id);
				socket.disconnect();
				return
			}

			// 房主更换
			if (roominfo.gm == data.userid) {
				logger.LOG_DEBUG(__filename, __line, "change gm from " + data.userid + " to " + roominfo.users[0].id)
				roominfo.gm = roominfo.users[0].id
			}

			// 通知
			logger.LOG_DEBUG(__filename, __line, roominfo)
			this.NotifyUserChange(roominfo)
		}
		socket.disconnect();
	},

	init: function(server) {
		io= require('socket.io')(server);
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
				callback(res)
			});

			// 房间列表
			socket.on('rooms req', (data, callback)=>{
				logger.LOG_DEBUG(__filename, __line, "rooms req: " + JSON.stringify(data));
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
				var roomid = Math.floor(new Date().getTime() / 1000);
				logger.LOG_DEBUG(__filename, __line, roomid)
				var res = {};
				res.users = new Array() // user列表
				
				game.Game.rooms[roomid] = {}
				var roominfo = game.Game.rooms[roomid]
				roominfo.id = roomid;
				roominfo.gm = data.userid;
				roominfo.title = game.Game.users[data.userid].name + "的房间" 
				roominfo.users = new Array()
				roominfo.users[0] = {id: data.userid}
				// TODO: 测试账号
				roominfo.users.push({id: "j1"})
				roominfo.users.push({id: "j2"})
				// roominfo.users.push({id: "j3"})

				res.roominfo = {}
				res.roominfo.id = roominfo.id;
				res.roominfo.gm = roominfo.gm;

				logger.LOG_DEBUG(__filename, __line, "game status: " + JSON.stringify(game.Game));

				for (i = 0; i < roominfo.users.length; i++)
				{
					res.users[i] = game.Game.users[roominfo.users[i].id];
				}

				// 记录连接
				var key = "room_" + roomid
				obj.socekts[key] = new Array;

				socket.userid = data.userid
				socket.roomid = roominfo.id

				obj.socekts[key].push(socket)
				callback(res)
			})
		})

		io.on('connection',  (socket)=>{
			logger.LOG_DEBUG(__filename, __line, 'client connect server, ok!');
		 
			socket.on('disconnect', (reason)=>{
				logger.LOG_DEBUG(__filename, __line, 'connect disconnect:' + reason);
				// 处理掉线
			});
		})

		// 保活
		// io.of('/keepalive').on('connection', socket => {
		// 	// 保活
		// 	socket.on('keepalive', (data)=>{
		// 		logger.LOG_DEBUG(__filename, __line, 'keepalive:' + data.session)
		// 		var rsp = {ret: 0}
		// 		if (game.GetSessionInfo(data.session) == undefined) {
		// 			// 服务器down了
		// 			logger.LOG_DEBUG(__filename, __line, 'keepalive failed')
		// 			rsp.ret = -10;
		// 		} else {
		// 			logger.LOG_DEBUG(__filename, __line, 'keepalive succ......')
		// 			game.UpdateAlive(data)
		// 		}
		// 		socket.emit('keepalive rsp', rsp)
		// 	})
		// })

		// 游戏长连接
		io.of('/game').on('connection', socket => {

			socket.on('disconnect', (data)=>{
				logger.LOG_DEBUG(__filename, __line, socket.id)
				logger.LOG_DEBUG(__filename, __line, socket.userid)
				logger.LOG_DEBUG(__filename, __line, socket.roomid)
				obj.handleLeave(socket, {userid:socket.userid, roomid:socket.roomid})
			})

			socket.on('leave room', (data)=>{
				obj.handleLeave(socket, data)
			})

			socket.on('enter room req', (data)=>{
				logger.LOG_DEBUG(__filename, __line, "enter room req: " + JSON.stringify(data));

				// 加入
				var roominfo = game.Game.rooms[data.roomid]
				roominfo.users.push({id: data.user})

				// 通知房间内的用户
				var res = obj.NotifyUserChange(roominfo)
				var key = "room_" + roominfo.id
				socket.userid = data.user
				socket.roomid = data.roomid
				obj.socekts[key].push(socket)
				socket.emit('enter room rsp', res)
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
					msg.usercards = games.vec[i]
					// msg.banker = mgames.users[i].id
					// 手牌单独发给用户
					obj.SendGameMessageTo(roominfo, mgames.users[i].id, msg)
				}
			})
		});
	}
}