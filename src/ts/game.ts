// Add this line at the top to tell TS 'io' exists globally
declare var io: any;

import * as BoardModule from "./board";
import * as PlayerModule from "./player";
import './lunar-background';

export const socket = io({
    transports: ["websocket"] 
});

function getOrCreatePlayerId(): string {
    let pid = sessionStorage.getItem('player_id');
    if (!pid) {
        pid = crypto.randomUUID(); // Generate a unique ID
        sessionStorage.setItem('player_id', pid);
    }
    return pid;
}

// When joining the game
const myPlayerId = getOrCreatePlayerId();

const BOARD_SIZE = 15;

interface SessionData {
    room_code: string;
    username: string;
    board: BoardModule.Board;    // Uses the Board type defined above
}

let currentRoom = "";

function createGame() {
    const user = (document?.getElementById('username') as HTMLInputElement)?.value;
    if (!user) return alert("Please enter a username");
    socket.emit('create_session', { username: user, player_id: myPlayerId });
}

function joinGame() {
    const username = (document?.getElementById('username') as HTMLInputElement)?.value;
    const room_code = (document?.getElementById('session-code') as HTMLInputElement)?.value.toUpperCase();
    if (!username || !room_code) return alert("Enter both username and code");
    console.log("Joining game...")
    socket.emit('join_session', { username: username, room_code: room_code, player_id: myPlayerId });
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

const toggleLoaders = (show: boolean): void => {
    const loaders = document.querySelectorAll<HTMLElement>('.lantern-loader');
    loaders.forEach((loader) => {
        loader.style.display = show ? 'block' : 'none';
    });
};

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
    const submitBtn = document.getElementById('submit-button') as HTMLButtonElement;
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
    socket.emit('submit_move', { pendingMoves: pendingMoves, room_code: currentRoom, player_id: myPlayerId });
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


// This fires for everyone whenever the player list changes
socket.on('player_list_updated', (data: {'players': PlayerModule.PlayerData[]}) => {
    updatePlayerSidebar(data.players);
});

function updatePlayerSidebar(players: PlayerModule.PlayerData[]) {
    const listElement = document.getElementById('player-list') as HTMLElement;
    listElement.innerHTML = ""; // Clear current list
    players.forEach(player => {
        const li = document.createElement('li');
        li.innerHTML = PlayerModule.printAllPlayerDetailsPretty(player);
        listElement.appendChild(li);
    });
}

interface HintResultData {
    englishHint: string;
    chineseHint: string;
}

function toggleHintButton(isLoading: boolean) {
    const hintBtn = document.getElementById('hint-button') as HTMLButtonElement;
    if (!hintBtn) return;

    if (isLoading) {
        hintBtn.disabled = true;
        hintBtn.innerText = "Consulting Oracle...";
        hintBtn.style.opacity = "0.5";
        hintBtn.style.cursor = "not-allowed";
    } else {
        hintBtn.disabled = false;
        hintBtn.innerText = "Get Hint";
        hintBtn.style.opacity = "1";
        hintBtn.style.cursor = "pointer";
    }
}

function getHint() {
    // Show that specific lantern spinner we built!
    toggleLoaders(true);
    toggleHintButton(true); // Disable Hint Button
    
    // Emit the request with the specific type
    socket.emit('request_hint', { 
        room_code: currentRoom, 
        player_id: myPlayerId
    });
}

// This fires for everyone whenever the player list changes
socket.on('display_hint', (data: HintResultData) => {
    toggleLoaders(false)
    toggleHintButton(false) // Re-enable hint button
    display_hint(data)
});

function display_hint(hintResult: HintResultData) {
    const hintScrolls = document.querySelectorAll<HTMLElement>('.hint-scroll');
    hintScrolls.forEach((hintScroll) => {
        hintScroll.innerHTML = `
        <div class="english-hint">
            <h2>English Hint:</h2>
            <p>
                ${hintResult.englishHint}
            </p>
        </div>
        <div class="chinese-hint">
            <h2>Chinese Hint:</h2>
            <p>
                ${hintResult.chineseHint}
            </p>
        </div>
        `
    });
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

// Make elements draggable (used for hint scroll)
function makeDraggable(el: HTMLElement) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    el.onmousedown = (e: MouseEvent) => {
        e.preventDefault();
        // Get mouse position at startup
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    };

    function elementDrag(e: MouseEvent) {
        e.preventDefault();
        // Calculate new cursor position
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // Set element's new position
        el.style.top = (el.offsetTop - pos2) + "px";
        el.style.left = (el.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // Stop moving when mouse button is released
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Define your initialization function
function initializeUI() {
    const hintScrollElement = document.querySelector('.hint-scroll') as HTMLElement;

    if (hintScrollElement) {
        // Attach the draggable logic we built
        makeDraggable(hintScrollElement);
        console.log("Hint Scroll initialized and draggable.");
    } else {
        console.warn("Hint Scroll element not found in the DOM.");
    }

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

// The "Document Ready" Listener
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUI);
} else {
    // DOM is already ready (e.g., if the script is deferred or loaded late)
    initializeUI();
}

// Export functions to window.
// TODO: Maybe better to use Event Listeners later
(window as any).createGame = createGame;
(window as any).joinGame = joinGame;
(window as any).leaveGame = leaveGame;
(window as any).submitMove = submitMove;
(window as any).cancelMove = cancelMove;
(window as any).getHint = getHint;