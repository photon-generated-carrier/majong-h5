$("#loginDiv").hide()
$(function (){
    $("#login").popover();
});

var urlPath = window.document.location.href;
var index = urlPath.indexOf("/", 7);
var serverPath = urlPath.substring(0, index);
var gUser = {}  // 当前用户
var gGame = {}; // 保存全局信息 {users:[{id,name}], roominfo:{gm, id}}

var game = new Phaser.Game(980, 1742, Phaser.AUTO, 'game')
game.scale = Phaser.ScaleManager.SHOW_ALL

game.state.add('Login', Login);
game.state.add('Room', Room);
game.state.add('Game', Game);

game.state.start('Login');

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

		gAliveTime = new Date().getTime()
		gAliveId = setInterval(function() {
			HandleKeepAlive()
		}, 2000)

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
