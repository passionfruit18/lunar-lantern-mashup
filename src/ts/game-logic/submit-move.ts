
import { socket, toggleLoaders, SessionData } from "./util";
import { gameState } from "./game-state";
import { drawBoard } from "./draw-board";

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

export function submitMove() {
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

function undoPendingMoves() {
    gameState.pendingMoves = []
    if (gameState.globalBoard) {
        drawBoard(gameState.globalBoard)
    }
}

export const cancelMove = undoPendingMoves


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