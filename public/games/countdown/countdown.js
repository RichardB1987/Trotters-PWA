const socket = io();
let players = [];
let round = 1;
let letters = [];
let vowelsCount = 0;
let consonantsCount = 0;
let buzzerLocked = false;
let conundrumSolution = "";

const vowelBtn = document.getElementById("vowel-btn");
const consonantBtn = document.getElementById("consonant-btn");
const startBtn = document.getElementById("start-clock");
const revealBtn = document.getElementById("reveal-btn");
const resetBuzzerBtn = document.getElementById("reset-buzzer-btn");
const lettersContainer = document.getElementById("letters-container");
const scoreboard = document.getElementById("scoreboard");
const timerDisplay = document.getElementById("timer-display");
const qrContainer = document.getElementById("qrcode");
const roundInfo = document.getElementById("round-info");
const buzzerStatus = document.getElementById("buzzer-status");

new QRCode(qrContainer, {
    text: window.location.origin + "/games/countdown/countdown-buzzer.html",
    width: 128,
    height: 128
});

function speak(text) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
}

const roundControls = document.getElementById("round-controls");

    function updateQrVisibility() {
        qrContainer.style.display = (round === 13) ? 'block' : 'none';
    }
    updateQrVisibility();


function render() {
    lettersContainer.innerHTML = "";
    for (let i = 0; i < 9; i++) {
        const tile = document.createElement("div");
        tile.className = "tile";
        tile.textContent = letters[i] || "";
        lettersContainer.appendChild(tile);
    }

    scoreboard.innerHTML = "";
    
    const addPlayerRow = document.createElement("div");
    addPlayerRow.style.marginBottom = "15px";
    addPlayerRow.innerHTML = '<input type="text" id="new-player-name" placeholder="Name" style="padding:5px; border-radius:5px;"><button class="pill" onclick="addPlayer()">Add</button>';
    scoreboard.appendChild(addPlayerRow);

    players.forEach(p => {
        const scoreEntry = document.createElement("div");
        scoreEntry.className = "score-entry";
        scoreEntry.style.backgroundColor = p.color || '#003366';
        scoreEntry.style.border = `2px solid ${p.color || '#6699cc'}`;
        scoreEntry.innerHTML = `
            <div style="font-weight:bold; margin-bottom:5px;">${p.name}</div>
            <div style="font-size:1.5rem; margin-bottom:5px;">${p.score || 0}</div>
            <button class="pill" style="padding:2px 8px; font-size:0.8rem;" onclick="updateScore('${p.name}', 1)">+</button>
            <button class="pill" style="padding:2px 8px; font-size:0.8rem;" onclick="updateScore('${p.name}', -1)">-</button>
        `;
        scoreboard.appendChild(scoreEntry);
    });

    if (round < 13) {
        if (letters.length >= 9) {
            vowelBtn.disabled = true;
            consonantBtn.disabled = true;
            startBtn.disabled = false;
        }
    } else {
        startBtn.disabled = false;
    }
}

function addPlayer() {
    const nameInput = document.getElementById("new-player-name");
    if (nameInput.value && !players.find(p => p.name === nameInput.value)) {
        players.push({ name: nameInput.value, score: 0 });
        nameInput.value = "";
        render();
    }
}

function updateScore(name, delta) {
    const player = players.find(p => p.name === name);
    if (player) {
        player.score = (player.score || 0) + delta;
        render();
    }
}

socket.on("player-joined", (player) => {
    if (!players.find(p => p.name === player.name)) {
        const colors = ['#8b0000', '#daa520', '#10b981', '#06b6d4'];
        players.push({ name: player.name, score: 0, color: colors[players.length % colors.length] });
        render();
    }
});

socket.on("buzzed", (player) => {
    if (!buzzerLocked) {
        buzzerLocked = true;
        const p = players.find(x => x.name === player.name);
        buzzerStatus.textContent = `${player.name} BUZZED IN!`;
        buzzerStatus.style.color = p ? p.color : 'var(--countdown-gold)';
        speak(`${player.name} buzzed in!`);
        resetBuzzerBtn.style.display = "inline-block";
    }
});

vowelBtn.addEventListener("click", () => {
    if (vowelsCount < 5 && letters.length < 9) {
        const l = "AEIOU"[Math.floor(Math.random() * 5)];
        letters.push(l);
        vowelsCount++;
        speak(l);
        render();
    }
});

consonantBtn.addEventListener("click", () => {
    if (consonantsCount < 6 && letters.length < 9) {
        const l = "BCDFGHJKLMNPQRSTVWXYZ"[Math.floor(Math.random() * 21)];
        letters.push(l);
        consonantsCount++;
        speak(l);
        render();
    }
});

function nextRound() {
    round++;
    if (round > 13) {
        alert("Game Over!");
        round = 1;
        players.forEach(p => p.score = 0);
    }
    letters = [];
    vowelsCount = 0;
    consonantsCount = 0;
    buzzerLocked = false;
    timerDisplay.textContent = 30;
    buzzerStatus.textContent = "";
    resetBuzzerBtn.style.display = "none";
    revealBtn.style.display = "none";
    
    // Unlock round controls
    vowelBtn.disabled = false;
    consonantBtn.disabled = false;
    startBtn.disabled = true;

    roundControls.innerHTML = "";
    
    if (round === 13) {
        roundInfo.textContent = "ROUND 13: CONUNDRUM";
        vowelBtn.style.display = "none";
        consonantBtn.style.display = "none";
        revealBtn.style.display = "inline-block";
        
        const word = "EDUCATION";
        conundrumSolution = word;
        letters = word.split("").sort(() => Math.random() - 0.5);
    } else {
        roundInfo.textContent = `Letters Round ${round}`;
        vowelBtn.style.display = "inline-block";
        consonantBtn.style.display = "inline-block";
        startBtn.disabled = true;
    }
    updateQrVisibility();

    render();
}

revealBtn.addEventListener("click", () => {
    letters = conundrumSolution.split("");
    render();
});

resetBuzzerBtn.addEventListener("click", () => {
    buzzerLocked = false;
    buzzerStatus.textContent = "";
    resetBuzzerBtn.style.display = "none";
});

startBtn.addEventListener("click", () => {
    let time = 30;
    startBtn.disabled = true;
    vowelBtn.disabled = true;
    consonantBtn.disabled = true;
    
    const timer = setInterval(() => {
        time--;
        timerDisplay.textContent = time;
        if (time <= 0) {
            clearInterval(timer);
            roundControls.innerHTML = '<button class="pill" onclick="nextRound()">Next Round</button>';
        }
    }, 1000);
});

render();
