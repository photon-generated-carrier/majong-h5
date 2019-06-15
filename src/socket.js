var Socket = {
	GetRooms : function(handler, obj) {
		var socket = io.connect(serverPath);
		console.log("get rooms");
		socket.emit('rooms req', { user : gUser.id});
		socket.on('rooms rsp', function (data) {
			// socket.disconnect();
			handler(data, obj)
		})
		return socket;
	},

	EnterRoom : function(handler, roomId, obj) {
		var socket = io.connect(serverPath);
		console.log("enter rooms:" + roomId);
		socket.emit('enter room req', { user : gUser.id, roomid : roomId});
		socket.on('enter room rsp', function (data) {
			socket.disconnect();
			handler(data, obj)
		})
	},

	CreateRoom : function(handler, userid, obj) {
		var socket = io.connect(serverPath);
		console.log("create room:" + userid);
		socket.emit('create room req', { userid : gUser.id });
		socket.on('create room rsp', function (data) {
			socket.disconnect();
			handler(data, obj)
		})
	}
}