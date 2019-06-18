
var logger = require("./mylogger")

exports.Game = {
	rooms : new Map, // {id, gm, started, title, users}
	users : new Map,
	mSession : new Map, // 连接列表
	mOnline : new Map, // 在线列表
	mOffline : new Map, // 掉线列表，用来断线重连
	games : new Map, // roomid -> {users:{id, cards:[]}, cards:{}}

	ShuffleSwap : function(arr) {
		if(arr.length == 1) return arr;
		let i = arr.length;
		while(--i > 1) {
		  let j = Math.floor(Math.random() * (i+1));
		  [arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	  },

	/* 洗牌
	return:
	  vec: 4组牌
	  cards: 牌库
	*/
	initGame : function() {
		var cards = new Array
		// 万条筒
		for (var i = 1; i <= 9; i++) {
			cards.push(10 + i);
			cards.push(10 + i);
			cards.push(10 + i);
			cards.push(10 + i);
			cards.push(20 + i);
			cards.push(20 + i);
			cards.push(20 + i);
			cards.push(20 + i);
			cards.push(30 + i);
			cards.push(30 + i);
			cards.push(30 + i);
			cards.push(30 + i);
		}

		this.ShuffleSwap(cards);
		var game = {};
		game.vec = new Array()
		game.vec[0] = cards.slice(0, 13)
		game.vec[1] = cards.slice(13, 26)
		game.vec[2] = cards.slice(26, 39)
		game.vec[3] = cards.slice(39, 52)
		game.cards = cards.slice(52);

		// game.banker = Math.floor(Math.random() * (4));
		console.log(game);
		return game
	}
};

this.Game.users["yy"] = {}
this.Game.users["yy"].id = "yy"
this.Game.users["yy"].name = "神y"

this.Game.users["j1"] = {}
this.Game.users["j1"].id = "j1"
this.Game.users["j1"].name = "机器人1号"

this.Game.users["j2"] = {}
this.Game.users["j2"].id = "j2"
this.Game.users["j2"].name = "机器人1号"

this.Game.users["j3"] = {}
this.Game.users["j3"].id = "j3"
this.Game.users["j3"].name = "机器人3号"

exports.GetUserName = function(userid) {
	var name;
	// name兜底，应该再去redis读的
	if (this.Game.users[userid] == undefined) {
		this.Game.users[userid] = {};
		this.Game.users[userid].id = userid;
		this.Game.users[userid].name = userid;
	} else {
		name = this.Game.users[userid].name
	}

	if (name == undefined) {
		name = userid;
		this.Game.users[userid].name = userid
	}

	return name
}

exports.UpdateSession = function(session) {
	if (session == undefined) {
		logger.LOG_ERROR(__filename, __line, "can't set undefined session")
		return
	}

	var curTime = new Date().getTime();
	if (this.Game.mSession[session]  == undefined) {
		this.Game.mSession[session] = {}
	}
	this.Game.mSession[session].uptime = curTime
}

// exp:3600 * 24 * 1000
exports.GetSessionInfo = function(session, exp) {
	var curTime = new Date().getTime();
	if (exp == undefined) { exp = 3600 * 24 * 1000 }
	if (this.Game.mSession[session] != undefined &&
		this.Game.mSession[session].uptime != undefined &&
		(curTime - this.Game.mSession[session].uptime) < exp) {
		return this.Game.mSession[session]
	}
	
	return undefined
}

exports.UpdateOnline = function(userid, session) {
	var curTime = new Date().getTime();

	if (userid == undefined) {
		logger.LOG_ERROR(__filename, __line, "can't set undefined Online")
		return
	}

	if (this.Game.mOnline[userid] == undefined) {
		this.Game.mOnline[userid] = {}
	}

	var user = this.Game.mOnline[userid];
	user.uptime = curTime;
	if (session != undefined) {
		user.session = session
	}
}

// data { userid, session }
exports.UpdateAlive = function(data) {
	this.UpdateOnline(data.userid)
	this.UpdateSession(data.session)
}

exports.removeRoom = function(roomid) {
	delete this.Game.rooms[roomid]
}

// 检查在线
exports.IsOnline = function(userid) {
	if (this.Game.mOnline[userid] != undefined) {
		var user = this.Game.mOnline[userid];
		// 存在有效的登陆信息
		if (user.uptime != undefined && (new Date().getTime() - user.uptime) < 300 * 1000) {
			logger.LOG_DEBUG(__filename, __line, userid + " is online");
			return true
		}
	}

	return false
}

// 更新在线
exports.UpdateOnline = function(userid, session) {
	if (this.Game.mOnline[userid] == undefined) {
		this.Game.mOnline[userid] = {};
	}
	if (session != undefined) {
		this.Game.mOnline[userid].session = session
	}
	this.Game.mOnline[userid].uptime = new Date().getTime()
}

// 处理掉线情况, status:掉线前的状态
exports.HandleDisconnect = function(userid, status) {
	logger.LOG_DEBUG(__filename, __line, "move " + userid + " to offline with status " + status);
	this.Game.mOffline[userid] = this.Game.mOnline[userid]
	this.Game.mOffline[userid].status = status
	this.Game.mOffline[userid].uptime = new Date().getTime()
	delete this.Game.mOnline[userid]
}

// 创建房间，返回roominfo
exports.CreateRoom = function(userid) {
	var roomid = "room:" + userid + ":" + Math.floor(new Date().getTime() / 1000);
	logger.LOG_DEBUG(__filename, __line, "crate room: " + roomid);

	this.Game.users[userid].room = roomid // 加入房间

	this.Game.rooms[roomid] = {}
	var roominfo = this.Game.rooms[roomid]
	roominfo.id = roomid;
	roominfo.gm = userid;
	roominfo.title = this.Game.users[userid].name + "的房间" 
	roominfo.users = new Array()
	roominfo.users[0] = {id: userid}

	// TODO: 测试账号
	roominfo.users.push({id: "j1"})
	roominfo.users.push({id: "j2"})
	// roominfo.users.push({id: "j3"})

	return roominfo
}

exports.EnterRoom = function(userid, roomid) {
	var res = {ret : 0}
	if (userid == undefined || roomid == undefined) {
		res.ret = -1
		return res
	}
	var roominfo = this.Game.rooms[roomid]
	if (roominfo == undefined) {
		res.ret = -1
		return res
	}
	
	roominfo.users.push({id: userid})

	return this.GenerateRoomRes(roominfo)
}

exports.GenerateRoomRes = function(roominfo) {
	var res = {ret : 0}
	if (roominfo == undefined) {
		res.ret = -1
		return res
	}

	res.roominfo = {}
	res.roominfo.id = roominfo.id;
	res.roominfo.gm = roominfo.gm;
	res.users = []
	for (i = 0; i < roominfo.users.length; i++)
	{
		res.users[i] = this.Game.users[roominfo.users[i].id];
	}

	return res
}

exports.LeaveRoom = function(socket, data) {
	logger.LOG_DEBUG(__filename, __line, data.userid + " leave room " + data.roomid)
	if (data.userid == undefined || data.roomid == undefined) {
		return
	}

	// 从socket列表中移除
	socket.leave(data.roomid)

	var roominfo = game.Game.rooms[data.roomid]
	if (roominfo == undefined) { return }

	// 游戏已开始
	if (roominfo.started != undefined && roominfo.started) {
		logger.LOG_DEBUG(__filename, __line, "game had started...")
		var msg = {}
		msg.state = "end";
		msg.oper = data.userid;
		msg.op = "leave"
		return msg;
		// this.SendGameMessage(roominfo, msg)
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
			return
		}

		// 房主更换
		if (roominfo.gm == data.userid) {
			logger.LOG_DEBUG(__filename, __line, "change gm from " + data.userid + " to " + roominfo.users[0].id)
			roominfo.gm = roominfo.users[0].id
		}

		// 通知
		socket.to(data.roomid).emit("room users changed", this.GenerateRoomRes(roominfo))
	}
}