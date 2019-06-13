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
		Socket.GetRooms(this.handleRooms)

		game.input.onDown.addOnce(function(){
		})
	},

	update: function () {
	},

	handleRooms : function(data) {
		console.log("get rooms: " + data.length);
		this.buttons = new Array
		for ( var i = 0; i < data.length; i++) {
			console.log("room:" + data[i].id + " num:" + data[i].num);
			this.buttons[i] = game.add.button(0 + 100 * i, 0, 'room', null, this);
			this.buttons[i].onInputDown.add(this.actionClick, {id:data[i].id}); 
		}
	},
	actionClick : function(button) {
		console.log("room click");
	}
}