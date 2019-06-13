var Socket = {
	GetRooms : function(handler, obj) {
		var socket = io.connect(serverPath);
		console.log("get rooms");
		socket.emit('rooms req', { user : gUser});
		socket.on('rooms rsp', function (data) {
			socket.disconnect();
			handler(data, obj)
		})
	}
}