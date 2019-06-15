
var Room = {
	preload: function () {
		console.log('preload');
		game.load.image('sky', 'assets/sky.png', game.width, game.height);
		game.load.image('room', 'assets/room.png');
		game.load.image('button', 'assets/button.png');
	},

	create: function () {
		console.log('create');
		game.add.sprite(0, 0, 'sky');
		this.platforms = game.add.group();
		this.platforms.enableBody = true;
		Socket.GetRooms(this.handleRooms, this)

		game.input.onDown.addOnce(function(){
		})
	},

	update: function () {
	},
	buttons : new Array,
	loginButton : undefined,

	handleRooms : function(data, obj) {
		console.log(obj)
		console.log("get rooms: " + data.length);
		for ( var i = 0; i < data.length; i++) {
			console.log("room:" + data[i].id + " num:" + data[i].num);
			obj.buttons[i] = game.add.button(0 + 100 * i, 50, 'room', null, this);
			// obj.buttons[i].scale.setTo(3.7, 1)
			obj.buttons[i].id = data[i].id;
			obj.buttons[i].num = data[i].num;
			obj.buttons[i].title = game.add.text(380 + 100 * i, 50 + 40, data[i].num + "/4", { fontSize: '64px', fill: '#0A0' });

			obj.buttons[i].onInputDown.add(function(button,pointer){
				obj.actionClick(button)
			}, data[i]); 
		}
		if (this.loginButton == undefined)
		{
			loginButton = game.add.button(100 + 100 * data.length, 520, 'button',null, this);
			loginButton.title = game.add.text(loginButton.x + 40, loginButton.y + 30, '创建房间', { fontSize: '48px', fill: '#0AA' });
			loginButton.user = gUser.id
			loginButton.onInputDown.add(function(button, pointer){
				obj.actionCreate(button)
			}, null); 
		}
		
	},

	actionCreate : function(button) {
		console.log("room click" + button.id + " " + button.num);
		Socket.EnterRoom(this.handleEnterRomm, button.id, this)
	},

	actionClick : function(button) {
		console.log("room click" + button.id + " " + button.num);
		Socket.EnterRoom(this.handleEnterRomm, button.id, this)
	},
	
	// 进入房间的回调
	handleEnterRomm : function(data, obj) {
		console.log("enter room back");
		console.log(data);
	}
}