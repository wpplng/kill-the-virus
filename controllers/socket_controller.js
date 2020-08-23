/**
 * Socket Controller
 */
const debug = require('debug')('kill-the-virus:socket_controller');
const players = {};

/**
 * Game
 */

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
	players[this.id] = playername;
	callback({
		joinGame: true,
		playernameInUse: false,
		onlinePlayers: getPlayers(),
	});

	// broadcast online players to all connected sockets EXCEPT ourselves
	this.broadcast.emit('online-players', getPlayers());
}

/** Handle player disconnecting */
function handlePlayerDisconnect() {
	debug(`Socket ${this.id} left the game.`);

	// broadcast to all connected sockets that this player has left the chat
	if (players[this.id]) {
		this.broadcast.emit('player-disconnected', players[this.id]);
	}
	delete players[this.id];
}

module.exports = function (socket) {
	debug(`Client ${socket.id} connected!`);
	socket.on('register-player', handleRegisterPlayer);
	socket.on('disconnect', handlePlayerDisconnect);
};
