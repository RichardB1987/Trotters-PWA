const socket = io();
const buzzerBtn = document.getElementById('buzzer');

buzzerBtn.addEventListener('click', () => {
    socket.emit('buzz');
});

// Setup
const playerName = prompt("Enter your name:", "Player " + Math.floor(Math.random() * 100));
socket.emit('join-game', playerName);

