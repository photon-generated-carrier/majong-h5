var Socket = {
	Login : function(handler, req) {
		var socket = io.connect(serverPath);
		socket.emit('login req', { id: req.id, password: req.password});
		socket.on('login rsp', function (data) {
			socket.disconnect();
			handler(data)
		});
	},

	GetRooms : function(handler, obj) {
		var socket = io.connect(serverPath);
		console.log("get rooms");
		socket.emit('rooms req', { user : gUser.id});
		socket.on('rooms rsp', function (data) {
			socket.disconnect();
			handler(data, obj)
		})
		
		return socket;
	},

	EnterRoom : function(handler, roomId, obj) {
		var socket = io.connect(serverPath);
		console.log("enter rooms:" + roomId);
		socket.emit('enter room req', { user : gUser.id, roomid : roomId});
		socket.on('enter room rsp', function (data) {
			handler(data, obj)
		})
		var my = this;
		socket.on('disconnect', function (data) {
			my.OnSvrDown();
		})
		return socket
	},

	CreateRoom : function(handler, userid, obj) {
		var socket = io.connect(serverPath);
		console.log("create room:" + userid);
		socket.emit('create room req', { userid : gUser.id });
		socket.on('create room rsp', function (data) {
			handler(data, obj)
		})
		var my = this;
		socket.on('disconnect', function (data) {
			my.OnSvrDown();
		})
		return socket
	}, 

	OnSvrDown : function() {
		console.log("svr down!!!!")
		// alert("服务器断开连接。。。。")
	},

	// 尝试用session连接
	Connect : function(handler) {
		var session = GetLocal("session", 3600 * 24 * 1000); // 1天过期
		if (session != undefined) {
			var socket = io.connect(serverPath);
			socket.emit('connect with session req', {session : session});
			socket.on('connect with session rsp', function (data) {
				socket.disconnect();
				handler(data)
			});
		} else {
			handler()
		}
	},
}
