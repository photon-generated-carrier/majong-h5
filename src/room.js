
var Room = {
	preload: function () {
		console.log('preload');
		game.load.image('ground', 'assets/ground.png');
		game.load.image('room', 'assets/room.png');
		game.load.image('button', 'assets/button.png');
	},

	create: function () {
		console.log('create');
		game.add.sprite(0, 0, 'ground');
		this.platforms = game.add.group();
		this.platforms.enableBody = true;
		this.needRefresh = true
		Socket.GetRooms(this.handleRooms, this)

		game.input.onDown.addOnce(function(){
		})
	},

	update: function () {
	},
	buttons : new Array,
	createButton : undefined, // 创建房间
	exitButton : undefined,	// 退出账号
	needRefresh : false, // 需要定时刷新

	handleRooms : function(data, obj) {
		if (!this.needRefresh) {
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
			obj.createButton.title = game.add.text(obj.createButton.x + 40, obj.createButton.y + 30, '创建房间', { fontSize: '48px', fill: '#0AA' });
			obj.createButton.user = gUser.id
			obj.createButton.onInputDown.add(function(button, pointer){
				obj.actionCreate()
			}, null); 
		} else {
			obj.createButton.y = 240 * data.length + 60;
			obj.createButton.title.y = obj.createButton.y + 30
		}

		if (obj.exitButton == undefined) {
			obj.exitButton = game.add.button(320, obj.createButton.y + 120, 'button', null, this);
			obj.exitButton.title = game.add.text(obj.createButton.x + 30, obj.createButton.y + 20, '当前账号:' + gUser.name + "\r\n",
									+ "退出账号？", { fontSize: '32px', fill: '#AAA' });
			obj.exitButton.onInputDown.add(function(button, pointer){
				obj.actionExit()
			}, null); 
		} else {
			obj.createButton.y = 240 * data.length + 60;
			obj.createButton.title.y = obj.createButton.y + 30
		}

		if (this.needRefresh) {
			setTimeout(function() {
				Socket.GetRooms(this.handleRooms, this)
			}, 1000);
		}
	},

	actionCreate : function() {
		if (gUser.id == undefined) {
			console.log("gUser.id is null, 请刷新")
			return;
		}
		this.needRefresh = false;
		gGameSocket = Socket.CreateRoom(this.handleCreateRomm, gUser.id)
	},

	actionClick : function(button) {
		console.log("room click" + button.id + " " + button.num);
		this.needRefresh = false;
		gGameSocket = Socket.EnterRoom(this.handleEnterRomm, button.id)
	},

	actionExit : function() {
		console.log("exit account");
		this.needRefresh = false;
		removeLocal("session")
		game.state.start("Login")
	},
	
	// 进入房间的回调
	handleEnterRomm : function(data) {
		console.log("enter room back");
		if (data == undefined) {
			console.log("enter room failed");
			this.needRefresh = true;
			Socket.GetRooms(this.handleRooms, this)
		}

		this.EnterRoom(data)
	},

	// 进入房间的回调
	handleCreateRomm : function(data) {
		console.log("create room back");
		if (data == undefined) {
			console.log("create room failed");
			this.needRefresh = true;
			Socket.GetRooms(this.handleRooms, this)
		}

		this.EnterRoom(data)
	},

	EnterRoom : function(data) {
		console.log("Enter room with:" + JSON.stringify(data));
		gGame = data;
		game.state.start('Game');
	}
}