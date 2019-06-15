var Game = {
	preload: function () {
		console.log('preload');
		game.load.image('ground', 'assets/ground.png');
		game.load.image('head', 'assets/head.png');
		game.load.image('crown', 'assets/crown.png');
		// game.load.image('cursor', 'assets/cursor.png');
	},

	startButton : undefined,
	create: function () {
		var obj = this
		gGameSocket.on('room users changed', function (data) {
			console.log("user changed")
			console.log(data)
			gGame = data
			obj.handleUserChanged(data)
		})
		game.add.sprite(0, 0, 'ground');
		this.platforms = game.add.group();
		this.platforms.enableBody = true;

		// 打牌区
		var graphic = game.add.graphics(235, 370);
		graphic.beginFill(0xce9424);
		graphic.moveTo(0,0);
		graphic.lineTo(510, 0);
		graphic.lineTo(510, 1000);
		graphic.lineTo(0, 1000);

		this.startButton = game.add.button(350, 530, 'button',null, this);
		this.startButton.title = game.add.text(this.startButton.x + 50, this.startButton.y + 30, '开始游戏', { fontSize: '48px', fill: '#0AA' });

		var exitButton = game.add.button(350, 830, 'button',null, this);
		exitButton.title = game.add.text(exitButton.x + 50, exitButton.y + 30, '退出房间', { fontSize: '48px', fill: '#0AA' });
		exitButton.onInputDown.add(function(button, pointer){
			console.log("退出房间")
			// this.socket.disconnect();
			game.state.start("Room")
		})

		this.handleUserChanged(gGame)
	},

	userInfo : undefined,
	crown : undefined,
	handleUserChanged : function(data) {
		if (this.userInfo != undefined) {
			for (var info in userInfo) {
				info.head.kill()
				info.txt.kill()
			}
		}

		console.log(data);

		if (this.crown != undefined) {
			this.crown.kill()
		}

		if (gUser.id == data.roominfo.gm) {
			this.startButton.onInputDown.add(function(button, pointer) {
				console.log("开始游戏！");
			});
			this.startButton.title.fill = "#A00";
		} else {
			this.startButton.onInputDown.removeAll();
			this.startButton.title.fill = "#AAA";
		}

		var users = data.users
		userInfo = new Array;
		if (users.length > 0) {
			var info = {}
			info.head = game.add.image(150, 32, 'head')
			info.txt = game.add.text(300, 32, users[0].name, { fontSize: '48px', fill: '#0AA' });
			userInfo.push(info)

			if (users[0].id == data.roominfo.gm) {
				this.crown = game.add.image(166, 16, 'crown')
			}

			var graphic = game.add.graphics(140, 150);
			graphic.beginFill(0xce9424);
			graphic.moveTo(0,0);
			graphic.lineTo(700, 0);
			graphic.lineTo(700, 100);
			graphic.lineTo(0, 100);
		}

		if (users.length > 1) {
			var info = {}
			info.head = game.add.image(150, 1640, 'head')
			info.txt = game.add.text(300, 1640, users[1].name, { fontSize: '48px', fill: '#0AA' });
			userInfo.push(info)

			var graphic = game.add.graphics(140, 1480);
			graphic.beginFill(0xce9424);
			graphic.moveTo(0,0);
			graphic.lineTo(700, 0);
			graphic.lineTo(700, 100);
			graphic.lineTo(0, 100);
		}

		// {
		// 	game.add.image(25, 360, 'head')
		// 	var text = game.add.text(25 + 60, 465, "宵狗", { fontSize: '48px', fill: '#0AA' });
		// 	text.angle = 90;
		// 	var graphic = game.add.graphics(130, 370);
		// 	graphic.beginFill(0xce9424);
		// 	graphic.moveTo(0,0);
		// 	graphic.lineTo(64, 0);
		// 	graphic.lineTo(64, 1000);
		// 	graphic.lineTo(0, 1000);
		// }

		// {
		// 	game.add.image(895, 360, 'head')
		// 	var text = game.add.text(895 + 60, 465, "阿杜狗", { fontSize: '48px', fill: '#0AA' });
		// 	text.angle = 90;
		// 	var graphic = game.add.graphics(790, 370);
		// 	graphic.beginFill(0xce9424);
		// 	graphic.moveTo(0,0);
		// 	graphic.lineTo(64, 0);
		// 	graphic.lineTo(64, 1000);
		// 	graphic.lineTo(0, 1000);
		// }
	},
};