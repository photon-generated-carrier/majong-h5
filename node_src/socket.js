login = require("./login")
game = require("./game")

// 在线用户保活
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
	init: function(server) {
		io= require('socket.io')(server);
	},
	bind: function() {
		io.on('connection',  (socket)=>{
			// console.log('client connect server, ok!');
		 
			// 监听断开连接状态：socket的disconnect事件表示客户端与服务端断开连接
			socket.on('disconnect', ()=>{
			//   console.log('connect disconnect');
				socket.disconnect();
				// 从列表中移除
				for(var key in this.socekts) {
					var index = this.socekts[key].indexOf(socket);
					if (index > -1) {
						console.log("remove from " + key)
						this.socekts[key].splice(index, 1);
					}
				}
			});

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
				console.log("rooms req: " + JSON.stringify(data));
				var res = new Array()
				for (var key in game.Game.rooms) {
					var room = {};
					room.id = key;
					room.num = game.Game.rooms[key].users.length;
					room.title = game.Game.rooms[key].title;
					room.gm = game.Game.rooms[key].gm;
					res.push(room)
				}
				// var num = GetRandomNum(0,4)
				// for (var i = 0; i < num; i++) {
				// 	res[i] = {id:1, num :GetRandomNum(0,4)}
				// }
				socket.emit('rooms rsp', res)
			})

			socket.on('enter room req', (data)=>{
				console.log("enter room req: " + JSON.stringify(data));
				var res = {};
				res.users = new Array() // user列表
				var roominfo = game.Game.rooms[data.roomid]
				roominfo.users.push({id: data.user})
				res.roominfo = {}
				res.roominfo.id = roominfo.id;
				res.roominfo.gm = roominfo.gm;

				for (i = 0; i < roominfo.users.length; i++)
				{
					res.users[i] = game.Game.users[roominfo.users[i].id];
				}

				// 通知房间内的用户
				var key = "room_" + data.roomid
				for (var i in this.socekts[key])
				{
					console.log("notify user changed to:" + this.socekts[key][i].id + ", " + JSON.stringify(res))
					io.to(this.socekts[key][i].id).emit('room users changed', res)
				}

				this.socekts[key].push(socket)
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
				this.socekts[key] = new Array;
				this.socekts[key].push(socket)

				socket.emit('create room rsp', res)

			})

			socket.on('start game req', (data)=>{
				console.log('start game req')
				var msg = {}
				msg.state = "init card";

				// 通知房间内的用户
				var key = "room_" + data.roomid
				for (var i in this.socekts[key])
				{
					this.socekts[key][i].emit('game msg', msg)
				}
			})
		})
	}
}