/**
 * Socket Controller
 */
const debug = require('debug')('kill-the-virus:socket_controller');
let io = null;

let count = 0;
let players = {};
let rounds = 0;
const maxRounds = 10;

/**
 * Game data
 */

/** Get random data */
function handleRandomData() {
	const time = Math.ceil(Math.random() * 5000);
	const randomVirus = Math.ceil(Math.random() * 3);
	const randomSize = Math.floor(Math.random() * (60 - 20)) + 20;
	const x = Math.ceil(Math.random() * (600 - randomSize));
	const y = Math.ceil(Math.random() * (400 - randomSize));

	return (getRandomData = {
		x,
		y,
		time,
		randomVirus,
		randomSize,
	});
}

/** Handle incoming virus click */
function handleVirusClick(playerData) {
	count++;
	debug('Rounds', rounds);
	let winner;

	if (count % 2 !== 0) {
		// give points to the fastest player (the first one that clicked is the first one in to the server)
		players[playerData.id].score++;
		rounds++;
	} else {
		const randomData = handleRandomData();
		debug('round', rounds);
		if (rounds < maxRounds) {
			// emit new game round
			io.emit('new-round', randomData, players);
		} else if (rounds === maxRounds) {
			// check who the winner is
			Object.values(players).map((player) => {
				debug('Player', player);
				if (player.score > 5) {
					winner = player.name;
					debug('Winner', winner);
					return winner;
				}
			});
			debug('Winner', winner);
			// emit 'end-game'-event when 10 rounds has been played and let the clients know who is the winner
			io.emit('end-game', players, winner);
			delete players[this.id];
			// reset game
			rounds = 0;
			players = {};
		}
	}
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

	players[this.id] = { name: playername, score: 0 };
	if (Object.keys(players).length <= 2) {
		callback({
			joinGame: true,
			playernameInUse: false,
			onlinePlayers: getPlayers(),
		});
		debug('Players', Object.keys(players).length);

		// broadcast online players to all connected sockets EXCEPT ourselves
		this.broadcast.emit('online-players', getPlayers());
		if (Object.keys(players).length === 2)
			// emit start-game event
			io.emit('start-game', handleRandomData(), players);
	} else {
		// emit too-many-players event if there already is two players in the game
		this.emit('too-many-players');
		delete players[this.id];
	}
}

/** Handle player disconnecting */
function handlePlayerDisconnect() {
	debug(`Socket ${this.id} left the game.`);

	// broadcast to all connected sockets that this player has left the game
	if (players[this.id]) {
		this.broadcast.emit('player-disconnected', players);
		// reset game if a player disconnects
		rounds = 0;
		players = {};
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
