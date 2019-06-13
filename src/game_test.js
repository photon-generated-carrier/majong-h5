var GameTest = {
	preload: function () {
		console.log('preload');
		game.load.image('sky', 'assets/sky.png', 800, 200);
		game.load.image('ground', 'assets/back.jpg');
		game.load.image('star', 'assets/star.png');
		game.load.image('cursor', 'assets/cursor.png');
		game.load.spritesheet('dude', 'assets/dude.png', 32, 50);
	},

	platforms:{},
	player:{},
	cursors:{},
	stars:{},
	score:0,
	scoreText:"",
	mcursors:{},
	mcursor:{},

	create: function () {
		console.log('create');
		game.physics.startSystem(Phaser.Physics.ARCADE);
		game.add.sprite(0, 0, 'sky');
		this.platforms = game.add.group();
		this.platforms.enableBody = true;
		var ground = this.platforms.create(0, game.world.height - 64, 'ground');
		ground.body.immovable = true;
		// ground.body.allowGravity = false;
		// ground.body.collideWorldBounds = true;
		ground.scale.setTo(0.37, 0.02);
		var ledge = this.platforms.create(400, 400, 'ground');
		ledge.body.immovable = true;
		ledge.scale.setTo(0.2, 0.01);
		ledge = this.platforms.create(-150, 250, 'ground');
		ledge.body.immovable = true;
		ledge.scale.setTo(0.2, 0.01);

		this.player = game.add.sprite(32, game.world.height - 150, 'dude');
		game.physics.arcade.enable(this.player);
		// player.body.bounce.y = 0.2;
		// player.body.gravity.y = 300;
		this.player.body.collideWorldBounds = true;
		this.player.animations.add('left', [4, 5, 6, 7], 10, true);
		this.player.animations.add('right', [8, 9, 10, 11], 10, true);
		this.player.animations.add('up', [12, 13, 14, 15], 10, true);
		this.player.animations.add('down', [0, 1, 2, 3], 10, true);

		this.cursors = game.input.keyboard.createCursorKeys();

		this.stars = game.add.group();
		this.stars.enableBody = true;
		for (var i = 0; i < 12; i++)
		{
			var star = this.stars.create(i * 70, 0, 'star');
			star.scale.setTo(0.3, 0.3);
			star.body.gravity.y = 300;
			star.body.bounce.y = 0.7 + Math.random() * 0.2;
		}

		this.scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

		this.mcursors = game.add.group();
		this.mcursors.enableBody = true;
		this.mcursor = this.mcursors.create(game.world.centerX, game.world.centerY, 'cursor').scale.setTo(0.2, 0.2);
	},

	lastAction:0,
	update: function () {
		// console.log('update');
		game.physics.arcade.collide(this.player, this.platforms);

		game.physics.arcade.collide(this.stars, this.platforms);
		game.physics.arcade.overlap(this.player, this.stars, this.collectStar, null, this)

		this.player.body.velocity.x = 0;
		this.player.body.velocity.y = 0;
		if (this.cursors.left.isDown)
		{
			this.player.body.velocity.x = -150;
			this.lastAction = 0;
			this.player.animations.play('left');
		}
		else if (this.cursors.right.isDown)
		{
			this.lastAction = 1;
			this.player.body.velocity.x = 150;
			this.player.animations.play('right');
		}
		else if (this.cursors.up.isDown)
		{
			this.lastAction = 2;
			this.player.body.velocity.y = -150;
			this.player.animations.play('up');
		}
		else if (this.cursors.down.isDown)
		{
			this.lastAction = 3;
			this.player.body.velocity.y = 150;
			this.player.animations.play('down');
		}
		else
		{
			this.player.animations.stop();
			if (this.lastAction == 0)
			{
				this.player.frame = 4;
			}
			else if (this.lastAction == 1)
			{
				this.player.frame = 8;
			}
			else if (this.lastAction == 2)
			{
				this.player.frame = 12;
			}
			else
			{
				this.player.frame = 0;
			}
		}
		// if (cursors.up.isDown && player.body.touching.down)
		// {
		// 	player.body.velocity.y = -350;
		// }
		game.input.addMoveCallback(this.move,this);
		// game.input.deleteMoveCallback(move,this);

		//是否正在触摸
		var touching = false;
		//监听按下事件
		player = this.player
		game.input.onDown.add (function(pointer){
			//palyer.x是主角的横向中心，判断是指触摸点在主角的最左侧到最右侧的坐标范围内，
			//就是点击的是小人本身，未判断y坐标
			if(Math.abs(pointer.x - player.x) < player.width/2){
				this.touching = true;
			}
			else
			{
				player.x = pointer.x;
				player.y = pointer.y;
			}
		});
		//监听离开事件
		game.input.onUp.add(function(){
			this.touching = false;
		});
	},

	collectStar: function  (player, star) {
		star.kill();

		this.score += 10;
		this.scoreText.text = 'Score: ' + this.score;
	},

	move: function (pointer,x,y,isTap) {
		this.mcursors.x = x - game.world.centerX;
		this.mcursors.y = y - game.world.centerY;
	}
};