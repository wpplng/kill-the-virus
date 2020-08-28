/**
 * Socket Controller
 */
const debug = require('debug')('kill-the-virus:socket_controller');
const players = {};
let io = null;

/**
 * Game
 */

function handleRandomData() {
	const x = Math.floor(Math.random() * (600 - 29));
	const y = Math.floor(Math.random() * (400 - 29));

	const time = Math.ceil(Math.random() * 5000);

	const randomVirus = Math.ceil(Math.random() * 3);

	const getRandomData = {
		x,
		y,
		time,
		randomVirus,
	};

	return getRandomData;
}

/**
 * Players
 */

/** Get names of online players */
function getPlayers() {
	return Object.values(players);
}

/** Handle a new player connecting */
function handleRegisterPlayer(playername, callback) {
	debug("Player '%s' connected to the game", playername);
	const randomData = handleRandomData();
	debug('This is randomData', randomData);
	players[this.id] = playername;
	callback({
		joinGame: true,
		playernameInUse: false,
		onlinePlayers: getPlayers(),
	});
	debug('Players', Object.keys(players).length);

	// broadcast online players to all connected sockets EXCEPT ourselves
	this.broadcast.emit('online-players', getPlayers());
	// emit start-game event
	io.emit('start-game', randomData, players);
}

/** Handle player disconnecting */
function handlePlayerDisconnect() {
	debug(`Socket ${this.id} left the game.`);

	// broadcast to all connected sockets that this player has left the game
	if (players[this.id]) {
		this.broadcast.emit('player-disconnected', players[this.id]);
	}
	delete players[this.id];
}

module.exports = function (socket) {
	io = this;
	debug(`Client ${socket.id} connected!`);
	socket.on('register-player', handleRegisterPlayer);
	socket.on('disconnect', handlePlayerDisconnect);
};
