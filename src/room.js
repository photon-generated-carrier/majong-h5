
var Room = {
	preload: function () {
		console.log('preload');
		game.load.image('sky', 'assets/sky.png', game.width, game.height);
		game.load.image('room', 'assets/room.png');
		game.load.image('button', 'assets/button.png');
	},

	getSocket : undefined,
	create: function () {
		console.log('create');
		game.add.sprite(0, 0, 'sky');
		this.platforms = game.add.group();
		this.platforms.enableBody = true;
		this.getSocket = Socket.GetRooms(this.handleRooms, this)

		game.input.onDown.addOnce(function(){
		})
	},

	update: function () {
	},
	buttons : new Array,
	createButton : undefined,

	handleRooms : function(data, obj) {
		console.log(obj)
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
			obj.buttons[i].title = game.add.text(obj.buttons[i].x + 380, obj.buttons[i].y + 40, data[i].num + "/4", { fontSize: '64px', fill: '#0A0' });

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

		setTimeout(function() {
			obj.getSocket.emit('rooms req', { user : gUser.id})
		}, 1000);
	},

	actionCreate : function() {
		console.log(this);
		Socket.CreateRoom(this.handleCreateRomm, this.createButton.user, this)
	},

	actionClick : function(button) {
		console.log("room click" + button.id + " " + button.num);
		this.getSocket.disconnect()
		Socket.EnterRoom(this.handleEnterRomm, button.id, this)
	},
	
	// 进入房间的回调
	handleEnterRomm : function(data, obj) {
		console.log("enter room back");
		console.log(data);
		// TODO:if failed, restart getRomms
	},

	// 进入房间的回调
	handleCreateRomm : function(data, obj) {
		console.log("create room back");
		console.log(data);
	}
}