const socket = io();

enum SquareType {
    NORMAL = "NORMAL",
    SPECIAL_TRANSLATION = "SPECIAL_TRANSLATION",
    DOUBLE_POINT = "DOUBLE_POINT",
    TRIPLE_POINT = "TRIPLE_POINT"
}

interface TileData {
    type: 'english' | 'chinese';
    display: string;
    components?: string[];
    points?: number;
}

interface SquareData {
    square_type: SquareType;
    tile: TileData | null;
}

const printSquare = (square: SquareData): string => {
    return JSON.stringify(square, null, 2);
};

type Board = SquareData[][];

interface SessionData {
    room_code: string;
    username: string;
    board: Board;    // Uses the Board type defined above
}

let currentRoom = "";

function createGame() {
    const user = (document?.getElementById('username') as HTMLInputElement)?.value;
    if (!user) return alert("Please enter a username");
    socket.emit('create_session', { username: user });
}

function joinGame() {
    const username = (document?.getElementById('username') as HTMLInputElement)?.value;
    const room_code = (document?.getElementById('session-code') as HTMLInputElement)?.value.toUpperCase();
    if (!username || !room_code) return alert("Enter both username and code");
    socket.emit('join_session', { username: username, room_code: room_code });
}

socket.on('session_created', (data: SessionData) => {
    enterRoom(data.room_code, data.username);
    drawBoard(data.board);
});

socket.on('join_success', (data: SessionData) => {
    enterRoom(data.room_code, data.username);
    drawBoard(data.board);
});

function enterRoom(room_code: string, username: string) {
    currentRoom = room_code;
    document?.getElementById('setup-area')?.classList.add('hidden');
    document?.getElementById('game-area')?.classList.remove('hidden');
    const roomDisplay = document?.getElementById('display-room-code')
    if (roomDisplay) {
        roomDisplay.innerText = room_code;
    }
    const usernameDisplay = document?.getElementById('display-username')
    if (usernameDisplay) {
        usernameDisplay.innerText = username;
    }
}

// Define the global state
let globalBoard: Board | null = null;

// Helper to check if the board is ready
function isGameReady(): boolean {
    return globalBoard !== null;
}

function drawBoard(board: Board) {
    globalBoard = board;
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    prepareCanvas(canvas)
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const size = 40; // square size

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

// This fires for everyone whenever the player list changes
socket.on('player_list_updated', (data: {'players': string[]}) => {
    updatePlayerSidebar(data.players);
});

function updatePlayerSidebar(players: string[]) {
    const listElement = document.getElementById('player-list') as HTMLElement;
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