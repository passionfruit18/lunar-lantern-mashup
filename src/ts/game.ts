// Add this line at the top to tell TS 'io' exists globally
declare var io: any;

import * as BoardModule from "./board";
import * as PlayerModule from "./player";
import './lunar-background';
import './player-list'
import { socket, SessionData } from "./util";
import { getHint, makeHintScrollDraggable } from "./hint";
import { gameState } from "./game-state";
import { drawBoard } from "./draw-board";
import { submitMove, cancelMove } from "./submit-move";


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

socket.on('session_error', (data: {'message': string}) => {
    alert(data.message);    
});


function leaveGame() {
    location.reload();
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