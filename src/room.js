
var Room = {
	preload: function () {
		console.log('preload');
		game.load.image('ground', 'assets/ground.png');
		game.load.image('room', 'assets/room_2.png');
		game.load.image('button', 'assets/button.png');
	},

	create: function () {
		if (this.createButton != undefined) {
			this.createButton.title.kill();
			this.createButton.kill()
			this.createButton = undefined
		}
		if (this.exitButton != undefined) {
			this.exitButton.title.kill();
			this.exitButton.kill()
			this.exitButton = undefined
		}

		console.log('create');
		game.add.sprite(0, 0, 'ground');
		this.platforms = game.add.group();
		this.platforms.enableBody = true;
		this.needRefresh = true
		Socket.GetRooms(this.handleRooms, this)
	},

	update: function () {
	},
	buttons : new Array,
	createButton : undefined, // 创建房间
	exitButton : undefined,	// 退出账号
	needRefresh : false, // 需要定时刷新

	handleRooms : function(data, obj) {
		if (!obj.needRefresh) {
			return
		}
		console.log("get rooms: " + data.length);
		for ( i = 0; i < obj.buttons.length; i++)
		{
			obj.buttons[i].title.kill()
			obj.buttons[i].kill()
		}
		obj.buttons = [];
		for ( var i = 0; i < data.length; i++) {
			console.log("room:" + data[i].id + " num:" + data[i].num);
			obj.buttons[i] = game.add.button(0, 240 * i + 50, 'room', null, this);
			// obj.buttons[i].scale.setTo(3.7, 1)
			obj.buttons[i].id = data[i].id;
			obj.buttons[i].num = data[i].num;
			obj.buttons[i].title = game.add.text(obj.buttons[i].x + 300, obj.buttons[i].y + 40, data[i].title + "\r\n" + data[i].num + "/4", { fontSize: '64px', fill: '#0A0' });

			obj.buttons[i].onInputDown.add(function(button,pointer){
				obj.actionClick(button)
			}, data[i]); 
		}
		if (obj.createButton == undefined)
		{
			obj.createButton = game.add.button(320, 240 * data.length + 60, 'button',null, this);
			obj.createButton.title = game.add.text(obj.createButton.x + 60, obj.createButton.y + 30, '创建房间', { fontSize: '48px', fill: '#0AA' });
			obj.createButton.user = gUser.id
			obj.createButton.onInputDown.add(function(button, pointer){
				obj.actionCreate()
			}, null); 
		} else {
			obj.createButton.y = 240 * data.length + 60;
			obj.createButton.title.y = obj.createButton.y + 30
		}

		if (obj.exitButton == undefined) {
			obj.exitButton = game.add.button(328, obj.createButton.y + 175, 'button', null, this);
			obj.exitButton.title = game.add.text(obj.exitButton.x + 30, obj.exitButton.y + 20, '当前账号:' + gUser.name + "\r\n"
									+ "    退出账号？", { fontSize: '32px', fill: '#A22' });
			obj.exitButton.onInputDown.add(function(button, pointer){
				obj.actionExit()
			}, null); 
		} else {
			obj.exitButton.y = obj.createButton.y + 175;
			obj.exitButton.title.y = obj.exitButton.y + 20
		}

		if (obj.needRefresh) {
			setTimeout(function() {
				Socket.GetRooms(obj.handleRooms, obj)
			}, 1000);
		}
	},

	actionCreate : function() {
		if (gUser.id == undefined) {
			console.log("gUser.id is null, 请刷新")
			return;
		}
		this.needRefresh = false;
		gGameSocket = Socket.CreateRoom(this.handleCreateRomm, gUser.id, this)
	},

	actionClick : function(button) {
		console.log("room click" + button.id + " " + button.num);
		this.needRefresh = false;
		gGameSocket = Socket.EnterRoom(this.handleEnterRomm, button.id, this)
	},

	actionExit : function() {
		console.log("exit account");
		this.needRefresh = false;
		ClearLocal("session")
		Socket.NotifyAccountExit(gUser.id);
		game.state.start("Login")
	},
	
	// 进入房间的回调
	handleEnterRomm : function(data, obj) {
		console.log("enter room back");
		if (data == undefined) {
			console.log("enter room failed");
			obj.needRefresh = true;
			Socket.GetRooms(obj.handleRooms, obj)
		}

		obj.EnterRoom(data)
	},

	// 进入房间的回调
	handleCreateRomm : function(data, obj) {
		console.log("create room back");
		if (data == undefined) {
			console.log("create room failed");
			obj.needRefresh = true;
			Socket.GetRooms(obj.handleRooms, obj)
		}

		obj.EnterRoom(data)
	},

	EnterRoom : function(data) {
		console.log("Enter room with:" + JSON.stringify(data));
		gGame = data;
		game.state.start('Game');
	}
}