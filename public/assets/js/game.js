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

// skapa clickhandler för virusImg som döljer virus

// starta spel som visar virus och körs i 10 omgångar

const getRandomData = (randomData) => {
	virusImg.style.left = randomData.x + 'px';
	virusImg.style.top = randomData.y + 'px';

	setInterval(() => {
		virusImg.style.display = 'block';
		virusImg.src = `./assets/images/virus-${randomData.randomVirus}.svg`;
	}, randomData.time);
};

const updateOnlinePlayers = (players) => {
	document.querySelector('#online-players').innerHTML = players
		.map((player) => `<li class="player">${player}</li>`)
		.join('');
};

const startGame = (randomData, players) => {
	console.log('startGame', randomData, players);
	console.log('Players length', Object.keys(players).length);

	if (Object.keys(players).length === 2) {
		virusImg.style.left = randomData.x + 'px';
		virusImg.style.top = randomData.y + 'px';

		setInterval(() => {
			virusImg.style.display = 'block';
			virusImg.src = `./assets/images/virus-${randomData.randomVirus}.svg`;
		}, randomData.time);
	}
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

socket.on('start-game', (randomData, players) => {
	startGame(randomData, players);
});
