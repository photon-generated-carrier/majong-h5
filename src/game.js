var Game = {
	preload: function () {
		console.log('preload');
		game.load.image('ground', 'assets/ground.png');
		game.load.image('head', 'assets/head.png');
		// game.load.image('cursor', 'assets/cursor.png');
	},

	create: function () {
		game.add.sprite(0, 0, 'ground');
		this.platforms = game.add.group();
		this.platforms.enableBody = true;

		var startButton = game.add.button(350, 530, 'button',null, this);
		startButton.title = game.add.text(startButton.x + 40, startButton.y + 30, '开始游戏', { fontSize: '48px', fill: '#0AA' });
		startButton.onInputDown.add(function(button, pointer){
			console.log("开始游戏...")
		})

		if (gUsers.length > 0) {
			game.add.image(150, 32, 'head')
			game.add.text(300, 32, gUsers[0].name, { fontSize: '48px', fill: '#0AA' });
			var graphic = game.add.graphics(140, 150);
			graphic.beginFill(0xce9424);
			graphic.moveTo(0,0);
			graphic.lineTo(700, 0);
			graphic.lineTo(700, 100);
			graphic.lineTo(0, 100);
		}

		{
			game.add.image(150, 1640, 'head')
			game.add.text(300, 1640, "磊狗", { fontSize: '48px', fill: '#0AA' });
			var graphic = game.add.graphics(140, 1480);
			graphic.beginFill(0xce9424);
			graphic.moveTo(0,0);
			graphic.lineTo(700, 0);
			graphic.lineTo(700, 100);
			graphic.lineTo(0, 100);
		}

		{
			game.add.image(25, 360, 'head')
			var text = game.add.text(25 + 60, 465, "宵狗", { fontSize: '48px', fill: '#0AA' });
			text.angle = 90;
			var graphic = game.add.graphics(130, 370);
			graphic.beginFill(0xce9424);
			graphic.moveTo(0,0);
			graphic.lineTo(64, 0);
			graphic.lineTo(64, 1000);
			graphic.lineTo(0, 1000);
		}

		{
			game.add.image(895, 360, 'head')
			var text = game.add.text(895 + 60, 465, "阿杜狗", { fontSize: '48px', fill: '#0AA' });
			text.angle = 90;
			var graphic = game.add.graphics(790, 370);
			graphic.beginFill(0xce9424);
			graphic.moveTo(0,0);
			graphic.lineTo(64, 0);
			graphic.lineTo(64, 1000);
			graphic.lineTo(0, 1000);
		}

		// 打牌区
		var graphic = game.add.graphics(235, 370);
		graphic.beginFill(0xce9424);
		graphic.moveTo(0,0);
		graphic.lineTo(510, 0);
		graphic.lineTo(510, 1000);
		graphic.lineTo(0, 1000);
	}
};