/**
 * Game
 */
const socket = io();

const startEl = document.querySelector('#start');
const playernameForm = document.querySelector('#playername-form');
const gameWrapperEl = document.querySelector('#game-wrapper');

let playername = null;

const updateOnlinePlayers = (players) => {
	document.querySelector('#online-players').innerHTML = players
		.map((player) => `<li class="player">${player}</li>`)
		.join('');
};

// get playername from form and emit 'register-player'-event to server
playernameForm.addEventListener('submit', (e) => {
	e.preventDefault();
	playername = document.querySelector('#playername').value;
	socket.emit('register-player', playername, (status) => {
		console.log('Server acknowledged the registration :D', status);

		if (status.joinGame) {
			startEl.classList.add('hide');
			gameWrapperEl.classList.remove('hide');

			updateOnlinePlayers(status.onlinePlayers);
		}
	});
});

socket.on('online-players', (players) => {
	updateOnlinePlayers(players);
});

socket.on('player-disconnected', (playername) => {
	console.log(`${playername} left the game.`);
});
