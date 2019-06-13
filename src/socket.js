var Socket = {
	GetRooms : function(handler) {
		var socket = io.connect(serverPath);
		console.log("get rooms");
		socket.emit('rooms req', { user : gUser});
		socket.on('rooms rsp', function (data) {
			handler(data)
			socket.disconnect();
		})
	}
}