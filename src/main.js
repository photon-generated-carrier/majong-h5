$("#loginDiv").hide()

var urlPath = window.document.location.href;
console.log(urlPath)
var index = urlPath.indexOf("/", 7);
console.log(index)
var serverPath = urlPath.substring(0, index);
console.log(serverPath)
var gUser = ""

// var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });
var game = new Phaser.Game(document.documentElement.clientWidth, document.documentElement.clientHeight, Phaser.AUTO, 'game');

game.state.add('Login', Login);
game.state.add('Room', Room);
game.state.add('Game', Game);

game.state.start('Room');

$("#login").click(function(){
	var socket = io.connect(serverPath);
	var user = $("#user").val()
	var pwd = $("#passwd").val()
	console.log("longin " + user + ":" + pwd);
	socket.emit('login req', { username: user, password: pwd});
	socket.on('login rsp', function (data) {
		if (data.ret == 0) {
			alert("登录成功！")
			$("#loginDiv").hide()
			gUser = user
			game.state.start('Game');
		} else {
			alert("登录失败！")
		}
		socket.disconnect();
	})
});
