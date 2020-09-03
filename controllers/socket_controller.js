/**
 * Socket Controller
 */
const debug = require('debug')('kill-the-virus:socket_controller');
const players = {};
let io = null;
let count = 0;

/**
 * Game
 */

/** Get random data */
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

/** Handle virus click */
function handleVirusClick(playerData) {
	count++;

	if (count % 2 !== 0) {
		players[playerData.id].score++;
	} else {
		const randomData = handleRandomData();
		io.emit('new-round', randomData, players);
	}

	debug('playerData in s_c', playerData);

	let player = {
		name: players[playerData.id].name,
		id: playerData.id,
		reactionTime: playerData.reactionTime,
	};

	debug('players', players);
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
	players[this.id] = { name: playername, score: 0 };
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
	socket.on('virus-click', handleVirusClick);
};
