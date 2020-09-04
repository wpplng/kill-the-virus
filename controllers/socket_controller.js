/**
 * Socket Controller
 */
const debug = require('debug')('kill-the-virus:socket_controller');
const players = {};
let io = null;
let count = 0;
let rounds = 0;
const maxRounds = 10;

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
	debug('Rounds', rounds);

	if (count % 2 !== 0) {
		players[playerData.id].score++;
		rounds++;
	} else {
		const randomData = handleRandomData();
		debug('round', rounds);
		if (rounds < maxRounds) {
			io.emit('new-round', randomData, players);
		} else if (rounds === maxRounds) {
			debug('Do we get here?', players[playerData.id].score);
			io.emit('end-game', players);
			rounds = 0;
			// if (players[this.id].score > 5) {
			// 	debug('Who is this?', players[this.id]);
			// 	io.emit('end-game', players, players[this.id]);
			// } else if (players[this.id].score === 5) {
			// 	io.emit('draw', players);
			// 	// } else {
			// 	// 	io.emit('loser', players[playerData.id]);
			// 	// 	io.emit('end-game', players, players[playerData.id]);
			// }
		}
	}

	debug('playerData in s_c', playerData);

	let player = {
		name: players[playerData.id].name,
		id: playerData.id,
		reactionTime: playerData.reactionTime,
	};

	debug('players', players);
	debug('player', player);
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
	rounds = 0;
}

module.exports = function (socket) {
	io = this;
	debug(`Client ${socket.id} connected!`);
	socket.on('register-player', handleRegisterPlayer);
	socket.on('disconnect', handlePlayerDisconnect);
	socket.on('virus-click', handleVirusClick);
};
