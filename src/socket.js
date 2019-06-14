var Socket = {
	GetRooms : function(handler, obj) {
		var socket = io.connect(serverPath);
		console.log("get rooms");
		socket.emit('rooms req', { user : gUser});
		socket.on('rooms rsp', function (data) {
			socket.disconnect();
			handler(data, obj)
		})
	},

	EnterRoom : function(handler, roomId, obj) {
		var socket = io.connect(serverPath);
		console.log("enter rooms:" + roomId);
		socket.emit('enter room req', { user : gUser, roomid : roomId});
		socket.on('enter room rsp', function (data) {
			socket.disconnect();
			handler(data, obj)
		})
	}
}