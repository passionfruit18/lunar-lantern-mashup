const socket = io();
let currentRoom = "";

function createGame() {
    const user = document.getElementById('username').value;
    if (!user) return alert("Please enter a username");
    socket.emit('create_session', { username: user });
}

function joinGame() {
    const username = document.getElementById('username').value;
    const room_code = document.getElementById('session-code').value.toUpperCase();
    if (!username || !room_code) return alert("Enter both username and code");
    socket.emit('join_session', { username: username, room_code: room_code });
}

socket.on('session_created', (data) => {
    enterRoom(data.room_code, data.username);
    drawBoard(data.board);
});

socket.on('join_success', (data) => {
    enterRoom(data.room_code, data.username);
    drawBoard(data.board);
});

function enterRoom(room_code, username) {
    currentRoom = room_code;
    document.getElementById('setup-area').classList.add('hidden');
    document.getElementById('game-area').classList.remove('hidden');
    document.getElementById('display-room-code').innerText = room_code;
    document.getElementById('display-username').innerText = username;
}

function drawBoard(board) {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const size = 40; // square size

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
            ctx.strokeStyle = "#ccc";
            ctx.strokeRect(c * size, r * size, size, size);
            if (board && board[r][c]) {
                ctx.fillStyle = "black";
                ctx.font = "20px Arial";
                ctx.fillText(board[r][c], c * size + 10, r * size + 28);
            }
        }
    }
}

// This fires for everyone whenever the player list changes
socket.on('player_list_updated', (data) => {
    updatePlayerSidebar(data.players);
});

function updatePlayerSidebar(players) {
    const listElement = document.getElementById('player-list');
    listElement.innerHTML = ""; // Clear current list
    players.forEach(name => {
        const li = document.createElement('li');
        li.innerText = name;
        listElement.appendChild(li);
    });
}

function leaveGame() {
    location.reload();
}