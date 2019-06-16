
exports.Game = {
	rooms : new Map, // {id, gm, started, title, users}
	users : new Map,
	mSession : new Map, // 连接列表
	mOnline : new Map, // 在线列表
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
