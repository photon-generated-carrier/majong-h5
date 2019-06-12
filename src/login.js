var Login = {
	preload: function () {
		console.log('preload');
		game.load.image('login', 'assets/login.jpg', 800, 200);
	},

	create: function () {
		console.log('create');
		game.physics.startSystem(Phaser.Physics.ARCADE);
		game.add.sprite(0, 0, 'login');
		this.platforms = game.add.group();
		this.platforms.enableBody = true;
	},

	update: function () {
	},
};