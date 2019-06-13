$("#loginDiv").hide()

// var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');

game.state.add('Login', Login);
game.state.add('Game', Game);

game.state.start('Login');

$("#login").click(function(){
	var socket = io.connect('http://localhost:8080');
	var user = $("#user").val()
	var pwd = $("#passwd").val()
	console.log("longin " + user + ":" + pwd);
	socket.emit('login req', { username: user, password: pwd});
	socket.on('login rsp', function (data) {
		if (data.ret == 0) {
			alert("登录成功！")
			$("#loginDiv").hide()
			game.state.start('Game');
		} else {
			alert("登录失败！")
		}
		socket.disconnect();
	})
});
