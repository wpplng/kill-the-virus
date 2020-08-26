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

const getRandomVirus = () => {
	const randomVirus = Math.ceil(Math.random() * 3);
	virusImg.src = `./assets/images/virus-${randomVirus}.svg`;
};

const getRandomPosition = () => {
	// gameBoard.innerHTML = `<img src="./assets/images/virus-a.svg">`;
	const boardHeight = gameBoard.clientHeight;
	const boardWidth = gameBoard.clientWidth;
	console.log('gameBoard', boardHeight, boardWidth);

	const y = Math.floor(Math.random() * (boardHeight - 29));
	const x = Math.floor(Math.random() * (boardWidth - 29));

	virusImg.style.top = y + 'px';
	virusImg.style.left = x + 'px';

	setInterval(() => {
		virusImg.style.display = 'block';
	}, Math.ceil(Math.random() * 5000));
};

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

		getRandomPosition();
		getRandomVirus();
	});
});

socket.on('online-players', (players) => {
	updateOnlinePlayers(players);
});

socket.on('player-disconnected', (playername) => {
	console.log(`${playername} left the game.`);
});
