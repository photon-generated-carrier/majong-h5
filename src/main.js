$("#loginDiv").hide()
$(function (){
    $("#login").popover();
});

var urlPath = window.document.location.href;
var index = urlPath.indexOf("/", 7);
var serverPath = urlPath.substring(0, index);
var gUser = {}  // 当前用户
var gGame = {}; // 保存全局信息 {users:[{id,name}], roominfo:{gm, id}}

var height = 1742
var width = 980
var game = new Phaser.Game(width, height, Phaser.AUTO, 'game')
game.scale = Phaser.ScaleManager.SHOW_ALL

game.state.add('Login', Login);
game.state.add('Room', Room);
game.state.add('Game', Game);

game.state.start('Login');

let direction = '1'
function getDirection() {
	switch (window.orientation) {
		case 0:
		case 180:
			direction = '1'
			break;
		case -90:
		case 90:
			direction = '一'
			break;
	}
}

window.onorientationchange = getDirection

/*
	login rsp = data {
		ret,
		id,
		name,
		session,
	}
*/
function handleLoginRsp(data) {
	if (data.ret == 0) {
		// alert("登录成功！")
		$("#loginDiv").hide()
		gUser.id = data.id
		gUser.name = data.name
		SetLocal("session", data.session) // 记录session

		game.state.start('Room');
	} else if (data.ret == -10) {
		// alert("已在线")
		// $("#login").attr("data-content", "已在线") ;
		console.log("已在线")
		$("#alertTxt").html("已在线") 
		$("#myModal").modal()
	} else {
		$("#alertTxt").html("登陆失败")
		$("#myModal").modal()
	}
}

$("#login").click(function() {
	var user = $("#user").val()
	var pwd = $("#passwd").val()
	console.log("longin " + user + ":" + pwd);
	Socket.Login(handleLoginRsp, {id:user, password: pwd})
})
