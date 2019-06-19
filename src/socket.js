var Socket = {
	socket : undefined,
	CreateSocket : function() {
		if (this.socket == undefined) {
			this.socket = io.connect(serverPath + "/login", {reconnect:false, 'connect timeout': 200, reconnection: 1000, pingInterval: 5000, pingTimeout: 200});
			this.socket.on('pong', () => {
				LOG_INFO('pong !')
				this.socket.emit('pongs', {});
			})

			this.socket.on('reconnect_attempt', (times) => {
				LOG_ERROR('reconncet [' + times + ']');
			});

			this.socket.on('reconnect', (times) => {
				LOG_ERROR('reconncet succ with [' + times + ']');
			});

			this.socket.on('connect_error', (error) => {
				LOG_ERROR('connect_error [' + error + ']');
			});

			this.socket.on('disconnect', (error) => {
				LOG_ERROR('disconnected, [' + error + ']');
				Login.Relogin("服务器断开，请重新登录!")
			})
		}
	},
	Login : function(handler, req) {
		this.CreateSocket()
		LOG_DEBUG("login req:" + JSON.stringify(req))
		this.socket.emit('login req', { id: req.id, password: req.password})
		var obj = this
		this.socket.once('login rsp', (data) => {
			LOG_INFO("login rsp:" + JSON.stringify(data))
			if (data.ret != 0) {
				obj.socket.disconnect()
				obj.socket = undefined
			}
			handler(data)
		});
	},

	// 尝试用session连接
	Connect : function(handler) {
		var session = GetLocal("session", 3600 * 24 * 1000); // 1天过期
		LOG_DEBUG("connect:" + session);
		if (session != undefined) {
			this.CreateSocket()
			this.socket.emit('connect with session req', {session : session}, (data) => {
				LOG_INFO("connect rsp:" + JSON.stringify(data))
				handler(data)
			});
		} else {
			LOG_DEBUG("connect failed, no session");
			handler()
		}
	},

	// 通知账号退出
	NotifyAccountExit : function(userid) {
		LOG_DEBUG("account exit:" + userid);
		// this.socket.emit('notify account exit', { userid : userid });
		this.socket.disconnect();
		this.socket = undefined;
	},

	GetRooms : function() {
		LOG_DEBUG("get rooms:" + gUser.id);
		this.socket.emit('rooms req', { user : gUser.id}, (data) => {
			LOG_INFO("rooms rsp:" + JSON.stringify(data))
			Room.data = data;
		});
	},

	EnterRoom : function(handler, roomId, obj) {
		LOG_DEBUG("enter rooms:" + roomId);
		this.socket.emit('enter room req', { user : gUser.id, roomid : roomId}, (data) => {
			LOG_INFO("enter rsp:" + JSON.stringify(data))
			handler(data, obj)
		})
	},

	CreateRoom : function(handler, userid, obj) {
		LOG_DEBUG("create room:" + userid);
		this.socket.emit('create room req', { userid : gUser.id }, (data) => {
			LOG_INFO("create room rsp:" + JSON.stringify(data))
			handler(data, obj)
		})
	}, 

	LeaveRoom : function(roomid) {
		LOG_DEBUG("leave room:" + {userid: gUser.id, roomid:roomid})
		this.socket.emit("leave room", {userid: gUser.id, roomid:roomid})
	},

	OnSvrDown : function() {
		console.log("svr down!!!!")
		// alert("服务器断开连接。。。。")
	},

	alive : false,
	KeepAlive : function() {
		// console.log("keep alive....");
		// this.alive = false; // 保活状态
		// socketAlive = io.connect(serverPath + "/keepalive", {reconnect:false,  'connect timeout': 100});
		// socketAlive.emit("keepalive", {userid: gUser.id, session: GetLocal("session")})
		// var obj = this;
		// socketAlive.on('keepalive rsp', function(rsp) {
		// 	if (rsp.ret == 0) {
		// 		console.log("keep alive succ........");
		// 		obj.alive = true;
		// 		gAliveTime = new Date().getTime()
		// 	} else {
		// 		console.log("server restarted....");
		// 		clearInterval(gAliveId);
		// 		Room.needRefresh = false;
		// 		game.state.start("Login");
		// 	}
		// })

		// socketAlive.on('connect_error', function(data){
		// 	console.log("keepalive" + ' - connect_error');
		// 	socketAlive.disconnect();
		// });
		// socketAlive.on('connect_timeout', function(data){
		// 	console.log("keepalive" + ' - connect_timeout');
		// 	socketAlive.disconnect();
		// });

		// UpdateLocalTime("session")
	},
}

function HandleKeepAlive() {
	// 包活超时
	if (new Date().getTime() - gAliveTime > 60 * 1000) {
		console.log("keep alive timeout ....");
		clearInterval(gAliveId);
		Room.needRefresh = false;
		game.state.start("Login");
		return
	}

	Socket.KeepAlive()
}
