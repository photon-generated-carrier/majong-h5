var Game = {
	preload: function () {
		console.log('preload');
		game.load.image('head', 'assets/head.png');
		game.load.image('crown', 'assets/crown.png');
		// game.load.image('cursor', 'assets/cursor.png');
		game.load.spritesheet('card', 'assets/majong.png', 196, 256);
	},

	gameStatus : 0, // -1:有人退出，0 : 等人, 1: 开局, 2:换牌
	msg : {},

	update: function() {
		if (this.msgNo > this.lastMsgNo) {
			LOG_DEBUG("msgNO:" + this.msgNo + " , lastNo:" + this.lastMsgNo)
			this.lastMsgNo = this.lastMsgNo + 1
		} else {
			return;
		}

		LOG_DEBUG("gameStatus:" + this.gameStatus)
		
		if (this.gameStatus == 0 || this.gameStatus == -1)
		{
			this.handleUserChanged(gGame)
		}

		if (this.gameStatus == 1)
		{
			this.renderCards(this.msg)
		}
	},

	/*
	11 ~ 19: 万
	21 ~ 29: 条
	31 ~ 39: 筒

	msg {
		state : string 状态,
		cards : map[user_id] -> vector<card> 每个人的手牌
		allcards : vecotr<card> 已打的牌
		lastcard : card 上一张打的牌
	}
	*/
	allcardsP : {x : 235, y: 370 },

	cards : [], // 我的牌
	cardsS : [], // 打出的牌

	renderCards : function(msg) {
		this.cardsS = msg.cards
		// 打出的牌
		if (msg.cards != undefined) {

		}
		if (msg.users != undefined) {
			for (var i in msg.users) {
				if (msg.users[i].id == gUser.id) {
					this.cards = msg.users[i].cards
					break
				}
			}
			if (this.cards == undefined) {
				return
			}
			// 手牌区
			var dx = 70;
			var dy = dx / 196 * 256;
			var scaleX = dx / 196;
			var scaleY = dy / 256;
			var i = 0;
			this.cardsS = []
			for (var i = 0; i < this.cards.length; i++) {
				var x = this.allcardsP.x + 10 + (i % 7) * dx
				var y = this.allcardsP.y + 5 + Math.floor(i / 7) * dy
				var index = Math.floor(this.cards[i] / 10) * 9 + this.cards[i] % 10 - 1;
				var image = game.add.button(x, y, "card", null, index, index, index);
				image.scale.setTo(scaleX, scaleY)
				image.onInputDown.add(function(button, pointer){
					var scaleXX = scaleX
					var scaleYY = scaleY
					if (button.scale.x == scaleX) {
						scaleXX = scaleX * 1.5
						scaleYY = scaleY * 1.5
					}
					button.scale.setTo(scaleXX, scaleYY)
				}, null)
				this.cardsS.push(image)
			}
		}
	},

	dealOneCard : function(msg) {
		
	},

	dealOrder : function(msg) {
		
	},

	dealWin : function(msg) {
		
	},

	dealEnd : function(msg) {
		
	},

	DoChange : function(msg) {
		
	},

	handleGameMsg : function(msg) {
		LOG_INFO("game msg: " + JSON.stringify(msg))
		// 初始发牌
		LOG_DEBUG("state:" + msg.state)
		switch (msg.state)
		{
		case "init card": // 开局
			this.startButton.kill();
			this.startButton.title.kill();
			this.exitButton.scale.setTo(0.5, 0.5)
			this.exitButton.title.scale.setTo(0.5, 0.5)
			this.exitButton.x = 800;
			this.exitButton.y = 10;
			this.exitButton.title.x = this.exitButton.x + 25;
			this.exitButton.title.y = this.exitButton.y + 15;
			this.msg = msg // 显示
			this.msgNo = this.msgNo + 1
			this.gameStatus = 1
			break;
		case "one card": // 打了一张牌
			this.dealOneCard(msg)
			break;
		case "order": // 需要你选择
			this.dealOrder(msg)
			break;
		case "win": // 结束
			this.dealWin(msg);
			break;
		case "end": // 结束
			this.dealEnd(msg);
			break;
		} 
	},

	startButton : undefined,
	create: function () {
		var obj = this
		Socket.socket.on('room users changed', function (data) {
			LOG_DEBUG("user changed")
			LOG_INFO(data)
			gGame = data
			obj.msgNo = obj.msgNo + 1;
		})
		Socket.socket.on('game msg', function(msg) {
			LOG_DEBUG('game msg')
			LOG_INFO(msg)
			obj.handleGameMsg(msg);
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

		// 手牌区
		// 上
		graphic = game.add.graphics(140, 150);
		graphic.beginFill(0xce9424);
		graphic.moveTo(0,0);
		graphic.lineTo(700, 0);
		graphic.lineTo(700, 100);
		graphic.lineTo(0, 100);

		// 下
		graphic = game.add.graphics(140, 1480);
		graphic.beginFill(0xce9424);
		graphic.moveTo(0,0);
		graphic.lineTo(700, 0);
		graphic.lineTo(700, 100);
		graphic.lineTo(0, 100);

		// 左
		graphic = game.add.graphics(130, 370);
		graphic.beginFill(0xce9424);
		graphic.moveTo(0,0);
		graphic.lineTo(64, 0);
		graphic.lineTo(64, 1000);
		graphic.lineTo(0, 1000);
		
		// 右
		graphic = game.add.graphics(790, 370);
		graphic.beginFill(0xce9424);
		graphic.moveTo(0,0);
		graphic.lineTo(64, 0);
		graphic.lineTo(64, 1000);
		graphic.lineTo(0, 1000);

		this.startButton = game.add.button(350, 530, 'button',null, this);
		this.startButton.title = game.add.text(this.startButton.x + 50, this.startButton.y + 30, '开始游戏', { fontSize: '48px', fill: '#0AA' });

		this.exitButton = game.add.button(350, 830, 'button',null, this);
		this.exitButton.title = game.add.text(this.exitButton.x + 50, this.exitButton.y + 30, '退出房间', { fontSize: '48px', fill: '#0AA' });
		this.exitButton.onInputDown.add(function(button, pointer){
			LOG_DEBUG("退出房间")
			Socket.LeaveRoom(gGame.roominfo.id)
			game.state.start("Room")
		})

		this.msgNo = this.msgNo + 1;
		this.handleUserChanged(gGame)
	},

	exitButton : undefined,
	StartGame : function() {
		LOG_DEBUG("开始游戏！");

		Socket.socket.emit("start game req", {roomid: gGame.roominfo.id})
	},

	msgNo : 0,
	lastMsgNo : 0,
	userInfo : undefined,
	crown : undefined,
	handleUserChanged : function(data) {
		if (this.userInfo != undefined) {
			for (var i in this.userInfo) {
				console.log("kill..")
				this.userInfo[i].head.kill()
				this.userInfo[i].txt.kill()
			}
		}

		console.log(data);

		if (this.crown != undefined) {
			this.crown.kill()
		}

		if (gUser.id == data.roominfo.gm && data.users.length == 4) {
			obj = this;
			this.startButton.onInputDown.add(function(button, pointer) {
				obj.StartGame();
			});
			this.startButton.title.fill = "#A00";
		} else {
			this.startButton.onInputDown.removeAll();
			this.startButton.title.fill = "#AAA";
		}

		var users = data.users
		this.userInfo = new Array;
		if (users.length > 0) {
			var info = {}
			info.head = game.add.image(150, 32, 'head')
			info.txt = game.add.text(300, 32, users[0].name, { fontSize: '48px', fill: '#0AA' });
			this.userInfo.push(info)

			if (users[0].id == data.roominfo.gm) {
				this.crown = game.add.image(166, 16, 'crown')
			}
		}

		if (users.length > 1) {
			var info = {}
			info.head = game.add.image(150, 1640, 'head')
			info.txt = game.add.text(300, 1640, users[1].name, { fontSize: '48px', fill: '#0AA' });
			this.userInfo.push(info)

			if (users[1].id == data.roominfo.gm) {
				this.crown = game.add.image(166, 16, 'crown')
			}
		}

		if (users.length > 2) {
			var info = {}
			info.head = game.add.image(25, 360, 'head')
			info.txt = game.add.text(25 + 60, 465, users[2].name, { fontSize: '48px', fill: '#0AA' });
			info.txt.angle = 90;
			this.userInfo.push(info)

			if (users[2].id == data.roominfo.gm) {
				this.crown = game.add.image(166, 16, 'crown')
			}
		}

		if (users.length > 3) {
			var info = {}
			info.head = game.add.image(895, 360, 'head')
			info.txt = game.add.text(895 + 60, 465, users[3].name, { fontSize: '48px', fill: '#0AA' });
			info.txt.angle = 90;
			this.userInfo.push(info)

			if (users[3].id == data.roominfo.gm) {
				this.crown = game.add.image(166, 16, 'crown')
			}
		}
	},
};