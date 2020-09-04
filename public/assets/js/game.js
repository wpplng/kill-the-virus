/**
 * Game
 */
const socket = io();

const startEl = document.querySelector('#start');
const playernameForm = document.querySelector('#playername-form');
const gameWrapperEl = document.querySelector('#game-wrapper');
const gameBoard = document.querySelector('#game-board');
const game = document.querySelector('#game');
const gameOver = document.querySelector('#game-over');
const tooManyPlayers = document.querySelector('#too-many-players');
const opponantLeft = document.querySelector('#opponant-left');
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
		.map((player) => `<h3>${player.name}</h3>`)
		.join(' vs ');
};

const updateScoreBoard = (players) => {
	document.querySelector('#online-players').innerHTML = Object.values(players)
		.map(
			(player) =>
				`<h3>${player.name} <span class='font-weight-bold'>${player.score}</span></h3>`
		)
		.join(' vs ');
};

const startGame = (randomData, players) => {
	console.log('startGame', randomData, players);
	console.log('Players length', Object.keys(players).length);

	if (Object.keys(players).length === 2) {
		getRandomData(randomData);
	}
};

const newRound = (randomData, players) => {
	virusImg.style.display = 'none';
	virusImg.classList.remove('hide');

	if (Object.keys(players).length === 2) {
		getRandomData(randomData);
		updateScoreBoard(players);
	}
};

const endGame = (players) => {
	console.log('Game over', players);
	gameBoard.classList.add('hide');
	gameOver.classList.remove('hide');

	updateScoreBoard(players);

	gameOver.innerHTML += Object.values(players)
		.map(
			(player) => `	
			<h3 class='d-inline'>${player.name} <span class='font-weight-bold'>${player.score}</span></h3></div>`
		)
		.join(' vs ');
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

socket.on('player-disconnected', (players) => {
	console.log(`One player left the game.`);
	gameWrapperEl.classList.add('hide');
	opponantLeft.classList.remove('hide');

	opponantLeft.innerHTML = `<div class="alert alert-secondary text-center" role="alert">
	<p>Your opponant left the game. Please start a new game.</p>
	</div>`;
	// updateOnlinePlayers(Object.values(players));
});

socket.on('start-game', (randomData, players) => {
	startGame(randomData, players);
});
socket.on('new-round', (randomData, players) => {
	newRound(randomData, players);
});

socket.on('end-game', (players) => {
	endGame(players);
});

socket.on('too-many-players', () => {
	startEl.classList.add('hide');
	tooManyPlayers.classList.remove('hide');

	tooManyPlayers.innerHTML = `<div class="alert alert-secondary text-center" role="alert">
		<p>Too many players, please try again later.</p>
		</div>`;
});
