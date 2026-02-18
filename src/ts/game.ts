import { io } from "socket.io-client";
import * as BoardModule from "./board";
import * as PlayerModule from "./player";

export const socket = io();


interface SessionData {
    room_code: string;
    username: string;
    board: BoardModule.Board;    // Uses the Board type defined above
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
    console.log("Joining game...")
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
let globalBoard: BoardModule.Board | null = null;

// Helper to check if the board is ready
function isGameReady(): boolean {
    return globalBoard !== null;
}

// Draw the board!
function drawBoard(board: BoardModule.Board) {
    globalBoard = board;
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    prepareCanvas(canvas)
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const size = 40; // square size
    const lengthBoard = 15 // length of board

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < lengthBoard; r++) {
        for (let c = 0; c < lengthBoard; c++) {
            const x = c * size
            const y = r * size
            ctx.strokeStyle = "#ccc";
            ctx.strokeRect(x, y, size, size);
            if (board && board[r][c] && board[r][c].tile) {
                ctx.fillStyle = "black";
                ctx.font = "20px Arial";
                ctx.fillText(BoardModule.simplePrintSquare(board[r][c]), x + 10, y + 28);
            }
            else {
                const pending = pendingMoves.find(m => m.row === r && m.col === c);
                if (pending) {
                    // Draw with a different style to indicate it's not submitted
                    ctx.fillStyle = "rgba(0, 102, 204, 0.7)"; // Translucent Blue
                    ctx.font = "bold 20px Arial";
                    
                    // Center the text slightly differently if you like
                    ctx.fillText(pending.value, x + 10, y + 28);
                    
                    // Optional: Draw a small border around pending tiles
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = "#0066cc";
                    ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
                    ctx.lineWidth = 1; // Reset line width
                }
            }
        }
    }
}

type PendingMove = {
    row: number,
    col: number,
    type: BoardModule.LanguageType,
    value: string }

let pendingMoves: PendingMove[] = [];


function handleSquareClick(board: BoardModule.Board, row: number, col: number) {
    const square = board[row][col];
    const inspector = document.getElementById('square-inspector') as HTMLElement;
    const squareDisplayJSON = BoardModule.printAllSquareDetails(square)
    console.log(squareDisplayJSON)
    // Using the Class method or Utility function
    inspector.innerText = squareDisplayJSON; 

    handleSquareClickEnterChar(board, row, col)
}

function handleSquareClickEnterChar(board: BoardModule.Board, row: number, col: number) {
    if (board[row][col].tile !== null) return; // Square occupied

    // Simple UI prompt for now
    const choice = prompt("Enter 'e' for English or 'c' for Chinese tile from your hand:");
    if (!choice) return;

    const value = prompt("Enter the specific character/letter:");
    
    if (value) {
        pendingMoves.push({ 
            row, col,
            type: choice === 'e' ?
            BoardModule.LanguageType.ENGLISH :
            BoardModule.LanguageType.CHINESE,
            value });
        // Add to pending (and visually update your local canvas)
        renderPendingMove(row, col, value); 
    }
    
}

function renderPendingMove(row: number, col: number, value: string) {
    if (globalBoard) {
        drawBoard(globalBoard)
    }
}

function submitMove() {
    socket.emit('submit_move', { pendingMoves: pendingMoves, room_code: currentRoom });
    pendingMoves = []; // Clear for next turn
}

function prepareCanvas(canvas: HTMLCanvasElement) {
    const BOARD_SIZE = 15;
    
    canvas.addEventListener('mousedown', (event: MouseEvent) => {
        console.log("Canvas Clicked")
        // 1. Get the bounding box of the canvas (accounts for scrolling/layout)
        const rect = canvas.getBoundingClientRect();
    
        // 2. Calculate the "Local" X and Y relative to the canvas top-left
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
    
        // 3. Divide by cell size and 'Floor' it to get the integer index
        const cellSize = canvas.width / BOARD_SIZE;
        
        const col = Math.floor(mouseX / cellSize);
        const row = Math.floor(mouseY / cellSize);
    
        // 4. Safety Check: Ensure the click wasn't on the border/padding
        if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
            console.log("Row:", row, "Column:", col)
            if (globalBoard) {            
                handleSquareClick(globalBoard, row, col);
            }
        }
    });
}


// This fires for everyone whenever the player list changes
socket.on('player_list_updated', (data: {'players': PlayerModule.PlayerData[]}) => {
    updatePlayerSidebar(data.players);
});

function updatePlayerSidebar(players: PlayerModule.PlayerData[]) {
    const listElement = document.getElementById('player-list') as HTMLElement;
    listElement.innerHTML = ""; // Clear current list
    players.forEach(player => {
        const li = document.createElement('li');
        li.innerText = PlayerModule.printAllPlayerDetails(player);
        listElement.appendChild(li);
    });
}

function leaveGame() {
    location.reload();
}

// Export functions to window. Maybe better to use Event Listeners later (TODO)
(window as any).createGame = createGame;
(window as any).joinGame = joinGame;
(window as any).leaveGame = leaveGame;