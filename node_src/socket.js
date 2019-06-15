login = require("./login")
game = require("./game")

function GetRandomNum(Min,Max) {   
	var Range = Max - Min;   
	var Rand = Math.random();   
	return(Min + Math.round(Rand * Range));   
}

exports.Socket = {
	io : {},
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
			});
			
			// 与客户端对应的接收指定的消息
			socket.on('login req', (data)=>{
				console.log("login req: " + data);
				login.Login(data, socket)
			});

			socket.on('rooms req', (data)=>{
				console.log("rooms req: " + data);
				var res = new Array()
				var num = GetRandomNum(0,4)
				for (var i = 0; i < num; i++) {
					res[i] = {id:1, num :GetRandomNum(0,4)}
				}
				socket.emit('rooms rsp', res)
			})

			socket.on('enter room req', (data)=>{
				console.log("enter room req: " + data);
				var res = new Array() // user列表
				// 第一人
				if (game.Game.rooms[data.roomid] == undefined)
				{
					game.Game.rooms[data.roomid] = {}
				}
				var roominfo = game.Game.rooms[data.roomid]
				roominfo.users = new Array()
				roominfo.users[0] = {name: "zl"}
				roominfo.users[1] = {name: "mx"}

				for (i = 0; i < roominfo.users.length; i++)
				{
					res[i] = {name: roominfo.users[i].name}
				}
				socket.emit('enter room rsp', res)
			})
		})
	}
}