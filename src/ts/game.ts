// Add this line at the top to tell TS 'io' exists globally
declare var io: any;

import * as BoardModule from "./board";
import * as PlayerModule from "./player";
import './lunar-background';
import './player-list'
import { socket, toggleLoaders } from "./util";
import { getHint, makeHintScrollDraggable } from "./hint";
import { gameState } from "./game-state";
import { drawBoard } from "./draw-board";

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
    socket.emit('submit_move', { pendingMoves: gameState.pendingMoves, room_code: gameState.currentRoom, player_id: gameState.myPlayerId });
    gameState.pendingMoves = []; // Clear for next turn
}

// Expected after moves made
socket.on('update_board', (data: SessionData) => {
    drawBoard(data.board);
    toggleLoaders(false);
    toggleSubmitButton(false); // Re-enable submit button
});

// Error
socket.on('move_error', (data: {'message': string}) => {
    alert(data.message);    
    undoPendingMoves()
    toggleLoaders(false);
    toggleSubmitButton(false); // Re-enable submit button
});

socket.on('session_error', (data: {'message': string}) => {
    alert(data.message);    
});

function undoPendingMoves() {
    gameState.pendingMoves = []
    if (gameState.globalBoard) {
        drawBoard(gameState.globalBoard)
    }
}

const cancelMove = undoPendingMoves

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