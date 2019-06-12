// var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');

game.state.add('Login', Login);
game.state.add('Game', Game);

game.state.start('Login');
// var socket = io.connect('http://localhost:8080');       
// socket.on('news', function (data) {
// 	console.log(data.hello);  
// 	socket.emit('my other event', { my: 'data' });  
// });

