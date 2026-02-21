// Add this line at the top to tell TS 'io' exists globally
declare var io: any;

import * as BoardModule from "./board";
import * as PlayerModule from "./player";
import './lunar-background';
import './player-list'
import { socket, toggleLoaders } from "./util";
import { getHint, makeHintScrollDraggable } from "./hint";
import { gameState } from "./game-state";



const BOARD_SIZE = 15;

interface SessionData {
    room_code: string;
    username: string;
    board: BoardModule.Board;    // Uses the Board type defined above
}


function createGame() {
    const user = (document?.getElementById('username') as HTMLInputElement)?.value;
    if (!user) return alert("Please enter a username");
    socket.emit('create_session', { username: user, player_id: gameState.myPlayerId });
}

function joinGame() {
    const username = (document?.getElementById('username') as HTMLInputElement)?.value;
    const room_code = (document?.getElementById('session-code') as HTMLInputElement)?.value.toUpperCase();
    if (!username || !room_code) return alert("Enter both username and code");
    console.log("Joining game...")
    socket.emit('join_session', { username: username, room_code: room_code, player_id: gameState.myPlayerId });
}

// Expected after createGame()
socket.on('session_created', (data: SessionData) => {
    enterRoom(data.room_code, data.username);
    drawBoard(data.board);
});

// Expected after joinGame()
socket.on('join_success', (data: SessionData) => {
    console.log("Join Success!")
    enterRoom(data.room_code, data.username);
    drawBoard(data.board);
});


function enterRoom(room_code: string, username: string) {
    gameState.currentRoom = room_code;
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

const GLOW_COLOR = "#ffaa00"; // Warm Lantern Orange
const TEXT_COLOR = "#ffffff"; // Bright White for the core of the letter

// Draw the board!
function drawBoard(board: BoardModule.Board) {    
    
    globalBoard = board;
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    prepareCanvas(canvas)
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const size = 40; // square size

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const x = c * size
            const y = r * size
            ctx.strokeStyle = "rgba(255, 215, 0, 0.2)";;
            ctx.strokeRect(x, y, size, size);
            if (board && board[r][c] && board[r][c].tile) {
                // 2. Set the Glow Effect
                ctx.shadowColor = GLOW_COLOR;
                ctx.shadowBlur = 10; // The spread of the glow
                ctx.fillStyle = TEXT_COLOR;
                ctx.font = "20px Arial";
                ctx.fillText(BoardModule.simplePrintSquare(board[r][c]), x + 10, y + 28);
            }
            else {
                const pending = pendingMoves.find(m => m.row === r && m.col === c);
                if (pending) {
                    // Draw with a different style to indicate it's not submitted
                    // 3. Pending Tiles (Blue Magic Glow)
                    ctx.shadowColor = "#00ccff";
                    ctx.shadowBlur = 15;
                    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
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
    const rawValue = prompt("Enter a letter or Chinese character:");
    if (!rawValue) return;

    // 1. Clean and Validate length
    const value = rawValue.trim();
    if (value.length !== 1) {
        alert("Please enter exactly one character.");
        return;
    }

    // 2. Automated Language Detection using Regex
    // \u4e00-\u9fa5 covers the common CJK Unified Ideographs block
    const isChinese = /[\u4e00-\u9fa5]/.test(value);
    const isEnglish = /[a-zA-Z]/.test(value);

    if (!isChinese && !isEnglish) {
        alert("Invalid character. Please use English (A-Z) or Chinese characters.");
        return;
    }

    // 3. Push the move using the detected type
    pendingMoves.push({
        row,
        col,
        type: isEnglish ? BoardModule.LanguageType.ENGLISH : BoardModule.LanguageType.CHINESE,
        value: isEnglish ? value.toUpperCase() : value // Auto-capitalize English
    });

    renderPendingMove(row, col, value);
    
    
}

function renderPendingMove(row: number, col: number, value: string) {
    if (globalBoard) {
        drawBoard(globalBoard)
    }
}

function toggleSubmitButton(isLoading: boolean) {
    const submitBtn = document.getElementById('submit-move-btn') as HTMLButtonElement;
    if (!submitBtn) return;

    if (isLoading) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Consulting Oracle...";
        submitBtn.style.opacity = "0.5";
        submitBtn.style.cursor = "not-allowed";
    } else {
        submitBtn.disabled = false;
        submitBtn.innerText = "Submit Move";
        submitBtn.style.opacity = "1";
        submitBtn.style.cursor = "pointer";
    }
}

function submitMove() {
    toggleLoaders(true)
    toggleSubmitButton(true) // Disable submit button
    triggerExplosion(); // Celebration!
    socket.emit('submit_move', { pendingMoves: pendingMoves, room_code: gameState.currentRoom, player_id: gameState.myPlayerId });
    pendingMoves = []; // Clear for next turn
}

// Expected after moves made
socket.on('update_board', (data: SessionData) => {
    drawBoard(data.board);
    toggleLoaders(false);
    toggleSubmitButton(false); // Re-enable submit button
});

// Error
socket.on('error', (data: {'message': string}) => {
    alert(data.message);    
    undoPendingMoves()
    toggleLoaders(false);
    toggleSubmitButton(false); // Re-enable submit button
});

function undoPendingMoves() {
    pendingMoves = []
    if (globalBoard) {
        drawBoard(globalBoard)
    }
}

const cancelMove = undoPendingMoves

let canvasInitialised = false


function prepareCanvas(canvas: HTMLCanvasElement) {

    if (!canvasInitialised) {        
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
        canvasInitialised = true
    }

}


function leaveGame() {
    location.reload();
}

// Explosion whenever the user submits a move
function triggerExplosion() {
    const maxRadius = 150; // How far they fly
    const particle_num = 80
    for (let i = 0; i < particle_num; i++) {
        const particle = document.createElement('div');
        particle.innerHTML = '🏮';
        particle.className = 'explosion-particle';
        
        // 1. Pick a random angle (0 to 2π radians)
        const angle = Math.random() * 2 * Math.PI;
        
        // 2. Pick a random distance (sqrt for uniform distribution)
        const distance = Math.sqrt(Math.random()) * maxRadius;
        
        // 3. Convert Polar to Cartesian (x, y)
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        particle.style.setProperty('--x', `${x}px`);
        particle.style.setProperty('--y', `${y}px`);
        
        document.body.appendChild(particle);
        
        // Remove after animation finishes
        setTimeout(() => particle.remove(), 1000);
    }
}


function setupUIListenersInput() {

    const nameInput = document.getElementById('username') as HTMLInputElement;
    const codeInput = document.getElementById('session-code') as HTMLInputElement;

    // Function to handle the "Smart Enter" logic
    const handleSmartEnter = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            const roomCode = codeInput?.value.trim();

            if (roomCode && roomCode.length > 0) {
                // If there's text in the code box, try to join
                console.log("Room code detected, joining game...");
                joinGame(); 
            } else {
                // If the code box is empty, assume they want a new game
                console.log("No room code, creating new game...");
                createGame();
            }
        }
    };

    // Attach the listener to BOTH inputs for the best UX
    nameInput?.addEventListener('keypress', handleSmartEnter);
    codeInput?.addEventListener('keypress', handleSmartEnter);
    nameInput?.focus();    
}

function setupUIListenersButtons() {
    // Export functions to window.
    // TODO: Maybe better to use Event Listeners later
    // 1. Game Actions
    document.getElementById('create-game-btn')?.addEventListener('click', createGame);
    document.getElementById('join-game-btn')?.addEventListener('click', joinGame);
    document.getElementById('leave-game-btn')?.addEventListener('click', leaveGame);

    // 2. Gameplay Actions
    document.getElementById('submit-move-btn')?.addEventListener('click', submitMove);
    document.getElementById('cancel-move-btn')?.addEventListener('click', cancelMove);

    // 3. The Hint System
    const hintBtn = document.getElementById('hint-btn')?.addEventListener('click', getHint);    
}

// Define your initialization function
function initializeUI() {
    makeHintScrollDraggable()
    setupUIListenersInput()
    setupUIListenersButtons()
}

// The "Document Ready" Listener
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUI);
} else {
    // DOM is already ready (e.g., if the script is deferred or loaded late)
    initializeUI();
}