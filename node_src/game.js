exports.Game = {
	rooms : new Map, // {id, gm, started, title, users}
	users : new Map,
	mSession : new Map, // 连接列表
	mOnline : new Map, // 在线列表
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
		console.log("can't set undefined session")
		return
	}

	var curTime = new Date().getTime();
	if (game.Game.mSession[session]  == undefined) {
		game.Game.mSession[session] = {}
	}
	game.Game.mSession[session].uptime = curTime
}

// exp:3600 * 24 * 1000
exports.GetSessionInfo = function(session, exp) {
	var curTime = new Date().getTime();
	if (exp == undefined) { exp = 3600 * 24 * 1000 }
	if (game.Game.mSession[session] != undefined &&
		game.Game.mSession[session].uptime != undefined &&
		(curTime - game.Game.mSession[session].uptime) < exp) {
		return game.Game.mSession[session]
	}
	
	return undefined
}

exports.UpdateOnline = function(userid, session) {
	var curTime = new Date().getTime();

	if (userid == undefined) {
		console.log("can't set undefined Online")
		return
	}

	if (game.Game.mOnline[userid] == undefined) {
		game.Game.mOnline[userid] = {}
	}

	var user = game.Game.mOnline[userid];
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
	delete game.Game.rooms[roomid]
}
