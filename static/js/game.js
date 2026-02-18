"use strict";
const socket = io();
var SquareType;
(function (SquareType) {
    SquareType["NORMAL"] = "NORMAL";
    SquareType["SPECIAL_TRANSLATION"] = "SPECIAL_TRANSLATION";
    SquareType["DOUBLE_POINT"] = "DOUBLE_POINT";
    SquareType["TRIPLE_POINT"] = "TRIPLE_POINT";
})(SquareType || (SquareType = {}));
const printSquare = (square) => {
    return JSON.stringify(square, null, 2);
};
let currentRoom = "";
function createGame() {
    var _a;
    const user = (_a = document === null || document === void 0 ? void 0 : document.getElementById('username')) === null || _a === void 0 ? void 0 : _a.value;
    if (!user)
        return alert("Please enter a username");
    socket.emit('create_session', { username: user });
}
function joinGame() {
    var _a, _b;
    const username = (_a = document === null || document === void 0 ? void 0 : document.getElementById('username')) === null || _a === void 0 ? void 0 : _a.value;
    const room_code = (_b = document === null || document === void 0 ? void 0 : document.getElementById('session-code')) === null || _b === void 0 ? void 0 : _b.value.toUpperCase();
    if (!username || !room_code)
        return alert("Enter both username and code");
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
    var _a, _b;
    currentRoom = room_code;
    (_a = document === null || document === void 0 ? void 0 : document.getElementById('setup-area')) === null || _a === void 0 ? void 0 : _a.classList.add('hidden');
    (_b = document === null || document === void 0 ? void 0 : document.getElementById('game-area')) === null || _b === void 0 ? void 0 : _b.classList.remove('hidden');
    const roomDisplay = document === null || document === void 0 ? void 0 : document.getElementById('display-room-code');
    if (roomDisplay) {
        roomDisplay.innerText = room_code;
    }
    const usernameDisplay = document === null || document === void 0 ? void 0 : document.getElementById('display-username');
    if (usernameDisplay) {
        usernameDisplay.innerText = username;
    }
}
let globalBoard = null;
function isGameReady() {
    return globalBoard !== null;
}
function drawBoard(board) {
    globalBoard = board;
    const canvas = document.getElementById('game-canvas');
    prepareCanvas(canvas);
    const ctx = canvas.getContext('2d');
    const size = 40;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
            ctx.strokeStyle = "#ccc";
            ctx.strokeRect(c * size, r * size, size, size);
            if (board && board[r][c]) {
                ctx.fillStyle = "black";
                ctx.font = "20px Arial";
                ctx.fillText(printSquare(board[r][c]), c * size + 10, r * size + 28);
            }
        }
    }
}
socket.on('player_list_updated', (data) => {
    updatePlayerSidebar(data.players);
});
function updatePlayerSidebar(players) {
    const listElement = document.getElementById('player-list');
    listElement.innerHTML = "";
    players.forEach(name => {
        const li = document.createElement('li');
        li.innerText = name;
        listElement.appendChild(li);
    });
}
function leaveGame() {
    location.reload();
}
