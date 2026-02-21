// Add this line at the top to tell TS 'io' exists globally
declare var io: any;

import './lunar-background';
import './player-list'
import { getHint, makeHintScrollDraggable } from "./hint";
import { submitMove, cancelMove } from "./submit-move";
import { createGame, joinGame, leaveGame } from "./session";

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