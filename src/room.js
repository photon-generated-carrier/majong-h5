
var Room = {
	preload: function () {
		console.log('preload');
		game.load.image('sky', 'assets/sky.png', game.width, game.height);
		game.load.image('room', 'assets/room.jpg', game.width - 20, 100);
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

	handleRooms : function(data, obj) {
		console.log(obj)
		console.log("get rooms: " + data.length);
		for ( var i = 0; i < data.length; i++) {
			console.log("room:" + data[i].id + " num:" + data[i].num);
			obj.buttons[i] = game.add.button(0 + 100 * i, 50 * i, 'room', null, this);
			obj.buttons[i].scale.setTo(3.7, 1)
			obj.buttons[i].id = data[i].id;
			obj.buttons[i].num = data[i].num;
			obj.buttons[i].title = game.add.text(380 + 100 * i, 50 * i + 40, data[i].num + "/4", { fontSize: '64px', fill: '#0A0' });

			obj.buttons[i].onInputDown.add(function(button,pointer){
				obj.actionClick(button)
			}, data[i]); 
		}
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