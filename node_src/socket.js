login = require("./login")
game = require("./game")

// 在线用户保活踢出
setInterval(function() {
	var curTime = new Date().getTime();

	for (var key in game.Game.mOnline) {
		var user = game.Game.mOnline[key]
		if ((curTime - user.uptime) > 240 * 1000) {
			console.log("remove " + key + "from online list, time:" + user.uptime)
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
			console.log("notify user changed to:" + this.socekts[key][i].id + ", " + JSON.stringify(res))
			this.socekts[key][i].emit('room users changed', res)
		}

		return res
	},
	
	// 向房间发送游戏消息
	SendGameMessage : function (roominfo, msg) {
		console.log("send msg to " + JSON.stringify(roominfo) + ", "+ JSON.stringify(msg))
		// 通知房间内的用户
		var key = "room_" + roominfo.id
		for (var i in this.socekts[key])
		{
			this.socekts[key][i].emit('game msg', msg)
		}
	},

	handleLeave : function(socket, data) {
		if (data.userid == undefined || data.roomid == undefined) {
			socket.disconnect();
		}

		console.log(data.userid + " leave room " + data.roomid)
		var founded = false;
		// 从socket列表中移除
		for(var key in this.socekts) {
			var index = this.socekts[key].indexOf(socket);
			if (index > -1) {
				console.log("remove from " + key)
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
			console.log("game had started...")
			var msg = {}
			msg.state = "end";
			msg.oper = data.userid;
			msg.op = "leave"
			this.SendGameMessage(roominfo, msg)
		} else {
			// 更新人员
			for (var i = 0; i < roominfo.users.length; i++) {
				if (roominfo.users[i].id == data.userid) {
					console.log("remove " + data.userid + " from room")
					roominfo.users.splice(i, 1);
					break;
				}
			}

			// 是否还有人
			if (roominfo.users.length == 0) {
				console.log("destroy room " + roominfo.id)
				// 销毁房间
				game.removeRoom(roominfo.id);
				socket.disconnect();
				return
			}

			// 房主更换
			if (roominfo.gm == data.userid) {
				console.log("change gm from " + data.userid + " to " + roominfo.users[0].id)
				roominfo.gm = roominfo.users[0].id
			}

			// 通知
			console.log(roominfo)
			this.NotifyUserChange(roominfo)
		}
		socket.disconnect();
	},

	init: function(server) {
		io= require('socket.io')(server);
	},
	bind: function() {
		var obj = this
		io.on('connection',  (socket)=>{
			// console.log('client connect server, ok!');
		 
			// 监听断开连接状态：socket的disconnect事件表示客户端与服务端断开连接
			// socket.on('disconnect', ()=>{
			// //   console.log('connect disconnect');
			// 	socket.disconnect();
			// 	// 从列表中移除
			// 	for(var key in this.socekts) {
			// 		var index = this.socekts[key].indexOf(socket);
			// 		if (index > -1) {
			// 			console.log("remove from " + key)
			// 			this.socekts[key].splice(index, 1);
			// 		}
			// 	}
			// });

			socket.on('connect with session req', (data)=>{
				console.log("connect with session req " + JSON.stringify(data));
				login.LoginWithSession(data, socket)
			});
			
			// 与客户端对应的接收指定的消息
			socket.on('login req', (data)=>{
				console.log("login req: " + JSON.stringify(data));
				login.Login(data, socket)
			});

			socket.on('rooms req', (data)=>{
				// console.log("rooms req: " + JSON.stringify(data));
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
				// var num = GetRandomNum(0,4)
				// for (var i = 0; i < num; i++) {
				// 	res[i] = {id:1, num :GetRandomNum(0,4)}
				// }
				socket.emit('rooms rsp', res)
			})

			// 账号退出
			socket.on('notify account exit', (data)=>{
				console.log('notify account exit:' + data.userid)
				delete game.Game.mOnline[data.userid];
				socket.disconnect()
			})
		})

		// 保活
		io.of('/keepalive').on('connection', socket => {
			// 保活
			socket.on('keepalive', (data)=>{
				// console.log('keepalive:' + data.session)
				var rsp = {ret: 0}
				if (game.GetSessionInfo(data.session) == undefined) {
					// 服务器down了
					console.log('keepalive failed')
					rsp.ret = -10;
				} else {
					game.UpdateAlive(data)
				}
				socket.emit('keepalive rsp', rsp)
			})
		})

		// 游戏长连接
		io.of('/game').on('connection', socket => {

			socket.on('disconnect', (data)=>{
				console.log(socket.id)
				console.log(socket.userid)
				console.log(socket.roomid)
				obj.handleLeave(socket, {userid:socket.userid, roomid:socket.roomid})
			})

			socket.on('leave room', (data)=>{
				obj.handleLeave(socket, data)
			})

			socket.on('enter room req', (data)=>{
				console.log("enter room req: " + JSON.stringify(data));

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

			socket.on('create room req', (data)=>{
				console.log("create room req: " + JSON.stringify(data));
				var roomid = Math.floor(new Date().getTime() / 1000);
				console.log(roomid)
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
				roominfo.users.push({id: "j3"})

				res.roominfo = {}
				res.roominfo.id = roominfo.id;
				res.roominfo.gm = roominfo.gm;

				console.log("game status: " + JSON.stringify(game.Game));

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
				socket.emit('create room rsp', res)

			})

			socket.on('start game req', (data)=>{
				console.log('start game req ' + data.roomid)
				var msg = {}
				msg.state = "init card";

				// game.removeRoom(data.roomid);

				var roominfo = game.Game.rooms[data.roomid]
				roominfo.started = true;
				obj.SendGameMessage(roominfo, msg)
			})
		});
	}
}