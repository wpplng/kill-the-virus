/**
 * Game
 */
const socket = io();

const startEl = document.querySelector('#start');
const playernameForm = document.querySelector('#playername-form');
const gameWrapperEl = document.querySelector('#game-wrapper');
const gameBoard = document.querySelector('#game-board');
let virusImg = document.querySelector('#virus-img');

let playername = null;
let virusShown = null;
let reactionTime = null;

const getRandomData = (randomData) => {
	virusImg.style.left = randomData.x + 'px';
	virusImg.style.top = randomData.y + 'px';
	setTimeout(() => {
		virusImg.style.display = 'block';
		virusImg.src = `./assets/images/virus-${randomData.randomVirus}.svg`;
		virusShown = Date.now();
	}, randomData.time);
};

const updateOnlinePlayers = (players) => {
	console.log('online players', players);
	document.querySelector('#online-players').innerHTML = players
		.map((player) => `<li class="player">${Object.values(player)}</li>`)
		.join('');
};

const newRound = (randomData, players) => {
	virusImg.style.display = 'none';
	virusImg.classList.remove('hide');

	if (Object.keys(players).length === 2) {
		getRandomData(randomData);
	}
};

const startGame = (randomData, players) => {
	console.log('startGame', randomData, players);
	console.log('Players length', Object.keys(players).length);

	if (Object.keys(players).length === 2) {
		getRandomData(randomData);
	}
};

// handle virus click
virusImg.addEventListener('click', () => {
	let clickTime = Date.now();
	reactionTime = clickTime - virusShown;

	const playerData = {
		id: socket.id,
		reactionTime,
	};

	virusImg.classList.add('hide');
	console.log('reaction time', reactionTime);

	socket.emit('virus-click', playerData);
});

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

socket.on('start-game', (randomData, players) => {
	startGame(randomData, players);
});
socket.on('new-round', (randomData, players) => {
	newRound(randomData, players);
});
