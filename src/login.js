var Login = {
	preload: function () {
		console.log('preload');
		game.load.image('login', 'assets/first.png');
	},

	create: function () {
		console.log('create');
		game.physics.startSystem(Phaser.Physics.ARCADE);
		game.add.sprite(0, 0, 'login');
		this.platforms = game.add.group();
		this.platforms.enableBody = true;

		var obj = this;
		game.input.onDown.addOnce(function() {
			Socket.Connect(obj.handleConnectRsp)
		})
	},

	update: function () {
	},

	handleConnectRsp: function(rsp) {
		if (rsp == undefined || rsp.ret != 0) {
			console.log("need login")
			$("#loginDiv").show()
		} else {
			console.log("reconnected")
			// 获取必要信息
			gUser.id = rsp.id
			gUser.name = rsp.name
			UpdateLocalTime("session")

			gAliveTime = new Date().getTime()
			gAliveId = setInterval(function() {
				HandleKeepAlive()
			}, 2000)
			
			// 切状态
			game.state.start('Room');
		}
	},
}