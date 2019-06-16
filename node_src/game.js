exports.Game = {
	rooms : new Map,
	users : new Map,
	mSession : new Map, // 连接列表
	mOnline : new Map, // 在线列表
};

// this.Game.users["yy"] = {}
// this.Game.users["yy"].id = "yy"
// this.Game.users["yy"].name = "神y"

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