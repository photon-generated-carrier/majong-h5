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
			LOG_ERROR("need login")
			$("#loginDiv").show()
		} else {
			LOG_DEBUG("reconnected:" + JSON.stringify(rsp))
			// 获取必要信息
			gUser.id = rsp.id
			gUser.name = rsp.name
			UpdateLocalTime("session")

			// 切状态
			game.state.start('Room');
		}
	},
}