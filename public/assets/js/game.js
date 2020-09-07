/**
 * Client
 */
const socket = io();

const game = document.querySelector('#game');
const gameBoard = document.querySelector('#game-board');
const gameOver = document.querySelector('#game-over');
const gameOverAlert = document.querySelector('#game-over-alert');
const gameWrapperEl = document.querySelector('#game-wrapper');
const opponantLeft = document.querySelector('#opponant-left');
const opponantLeftWrapper = document.querySelector('#opponant-left-wrapper');
const playAgain = document.querySelector('#play-again');
const playAgainDisconnect = document.querySelector('#play-again-disconnect');
const playernameForm = document.querySelector('#playername-form');
const startEl = document.querySelector('#start');
const tooManyPlayers = document.querySelector('#too-many-players');
let virusImg = document.querySelector('#virus-img');

let playername = null;

/**
 * Help functions
 */

/** Handle randomizing om data */
const getRandomData = (randomData) => {
	virusImg.style.left = randomData.x + 'px';
	virusImg.style.top = randomData.y + 'px';
	setTimeout(() => {
		virusImg.classList.remove('hide');
		virusImg.style.width = randomData.randomSize + 'px';
		virusImg.style.height = randomData.randomSize + 'px';
		virusImg.style.display = 'block';
		virusImg.src = `./assets/images/virus-${randomData.randomVirus}.svg`;
	}, randomData.time);
};

/** Update online player list */
const updateOnlinePlayers = (players) => {
	document.querySelector('#online-players').innerHTML = players
		.map((player) => `<h3>${player.name}</h3>`)
		.join(' vs ');
};

/** Update online player list with current score */
const updateScoreBoard = (players) => {
	document.querySelector('#online-players').innerHTML = Object.values(players)
		.map(
			(player) =>
				`<h3>${player.name} <span class='font-weight-bold'>${player.score}</span></h3>`
		)
		.join(' vs ');
};

/** Handle start game */
const startGame = (randomData, players) => {
	if (Object.keys(players).length === 2) {
		getRandomData(randomData);
	}
};

/** Handle new round */
const newRound = (randomData, players) => {
	virusImg.style.display = 'none';
	virusImg.classList.remove('hide');

	if (Object.keys(players).length === 2) {
		getRandomData(randomData);
		updateScoreBoard(players);
	}
};

/** Handle end of game */
const endGame = (players, winner) => {
	gameBoard.classList.add('hide');
	gameOver.classList.remove('hide');

	updateScoreBoard(players);

	gameOverAlert.innerHTML = winner
		? `<h1>Game Over</h1><h2 class='my-2'>The winner is ${winner}</h2>`
		: `<h1>Game Over</h1><h2 class='my-2'>It's a tie!</h2>`;
};

/** Handle too many players */
const handleTooManyPlayers = () => {
	startEl.classList.add('hide');
	tooManyPlayers.classList.remove('hide');
	opponantLeftWrapper.classList.add('hide');

	tooManyPlayers.innerHTML = `<div id="too-many-players-alert" class="alert alert-secondary text-center" role="alert">
	<p>Too many players, please come back later.</p>
	</div>`;
};

/** Handle player disconnected */
const playerDisconnected = (players) => {
	updateOnlinePlayers(Object.values(players));
	gameWrapperEl.classList.add('hide');
	opponantLeft.classList.remove('hide');
};

/**
 * Event listeners
 */

/** Handle register-player event */
playernameForm.addEventListener('submit', (e) => {
	e.preventDefault();
	playername = document.querySelector('#playername').value;

	socket.emit('register-player', playername, (status) => {
		if (status.joinGame) {
			startEl.classList.add('hide');
			gameWrapperEl.classList.remove('hide');
			updateOnlinePlayers(status.onlinePlayers);
		}
	});
});

/** Handle virus click */
virusImg.addEventListener('click', () => {
	const playerData = {
		id: socket.id,
	};

	virusImg.classList.add('hide');

	socket.emit('virus-click', playerData);
});

/** Handle play again button */
playAgain.addEventListener('click', (e) => {
	gameWrapperEl.classList.add('hide');
	gameOver.classList.add('hide');
	startEl.classList.remove('hide');
	gameBoard.classList.remove('hide');
	virusImg.classList.add('hide');
});

/** Handle play again button if a user disconnected */
playAgainDisconnect.addEventListener('submit', (e) => {
	e.preventDefault();
	opponantLeft.classList.add('hide');
	startEl.classList.remove('hide');
	gameBoard.classList.remove('hide');
	virusImg.classList.add('hide');
});

/**
 * Incoming events from the server
 */

socket.on('online-players', (players) => {
	updateOnlinePlayers(players);
});

socket.on('start-game', (randomData, players) => {
	startGame(randomData, players);
});
socket.on('new-round', (randomData, players) => {
	newRound(randomData, players);
});

socket.on('end-game', (players, winner) => {
	endGame(players, winner);
});

socket.on('too-many-players', handleTooManyPlayers);

socket.on('player-disconnected', (players) => {
	playerDisconnected(players);
});
